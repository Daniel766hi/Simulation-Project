"""Write the outcome of the pre-registered tests as a short Markdown report.

Reads what the frozen scripts already wrote and adds nothing to the analysis:
    outputs/extended_comparison.json   (extended_comparison.py: 9-window hypothesis tests)
    outputs/stack_holdout.json         (stacking.py test: frozen stack weights on held-out windows)

    cd m5/src && python3 final_report.py      # -> outputs/final_report.md

Anything computed on fewer windows than were planned is labelled provisional, so an early run
cannot be mistaken for the result.
"""
import json
from pathlib import Path

OUTPUTS = Path(__file__).resolve().parents[1] / "outputs"

LABELS = {"ours": "This pipeline", "ours_masked": "This pipeline, stock-out masking", "winner": "M5 winner's recipe",
          "combined": "50/50 combination", "combined_masked": "50/50 combination, masked",
          "stack": "Stacked blend (frozen weights)"}
HYPOTHESES = {"H1": "The 50/50 combination beats the winner's recipe",
              "H2": "This pipeline beats the winner's recipe",
              "H3": "This pipeline with stock-out masking beats the winner's recipe",
              "exploratory": "Exploratory: masked combination beats the winner's recipe"}


def status(res):
    done, planned = res.get("complete", 0), res.get("planned", 0)
    return "final" if planned and done == planned else f"provisional ({done} of {planned} windows)"


def table(windows, cols):
    head = "| Window | " + " | ".join(LABELS.get(c, c) for c in cols) + " |"
    rule = "|---|" + "---|" * len(cols)
    rows = []
    for w in sorted(windows, key=int):
        best = min(windows[w][c] for c in cols)
        cells = [f"**{windows[w][c]:.4f}**" if windows[w][c] == best else f"{windows[w][c]:.4f}" for c in cols]
        rows.append(f"| {w} | " + " | ".join(cells) + " |")
    return "\n".join([head, rule, *rows])


def comparison_section(res):
    cols = [c for c in ("winner", "ours", "ours_masked", "combined", "combined_masked") if c in res["mean"]]
    out = [f"## Pre-registered 9-window test: {status(res)}", "",
           "WRMSSE per untouched window, lower is better; the best in each row is in bold.", "",
           table(res["windows"], cols), "",
           "| Mean | " + " | ".join(f"{res['mean'][c]:.4f}" for c in cols) + " |", "",
           "| Hypothesis | Mean difference | Windows won | Wilcoxon p | Diebold–Mariano p | Supported |",
           "|---|---|---|---|---|---|"]
    for key, t in res["tests"].items():
        out.append(f"| {HYPOTHESES.get(key, key)} | {t['mean_diff']:+.4f} | {t['wins']} of {t['n']} | "
                   f"{t['wilcoxon_p']:.3f} | {t['dm_t_p']:.3f} | {'yes' if t['supported'] else 'no'} |")
    out += ["", "A hypothesis counts as supported only if both tests give p < 0.05 and the method wins most windows,",
            "as fixed in `extended_comparison.py` before any of the new windows was scored."]
    return "\n".join(out)


def stacking_section(res):
    w = ", ".join(f"{k} {v:.2f}" for k, v in res["weights"].items())
    verdict = ("The stack beat both the winner's recipe and the 50/50 combination on the mean."
               if res.get("better_than_both") else
               "The stack did not beat both references on the mean, so the 50/50 combination stays the method."
               if status(res) == "final" else "Not all holdout windows are scored yet; no verdict.")
    return "\n".join([f"## Stacking holdout: {status(res)}", "",
                      f"Weights were fitted on earlier windows and frozen before the holdout: {w}.", "",
                      table(res["windows"], ["winner", "combined", "stack"]), "",
                      f"Stack beat the winner's recipe in {res['stack_wins_vs_winner']} and the combination in "
                      f"{res['stack_wins_vs_combined']} of {res['complete']} windows. {verdict}"])


def build(comparison=None, stacking=None):
    parts = ["# M5 results", ""]
    parts.append(comparison_section(comparison) if comparison else "## Pre-registered 9-window test\n\nNot run yet.")
    parts.append("")
    parts.append(stacking_section(stacking) if stacking else "## Stacking holdout\n\nNot run yet.")
    return "\n".join(parts) + "\n"


def load(name):
    p = OUTPUTS / name
    return json.loads(p.read_text()) if p.exists() else None


if __name__ == "__main__":
    text = build(load("extended_comparison.json"), load("stack_holdout.json"))
    (OUTPUTS / "final_report.md").write_text(text)
    print(text)
