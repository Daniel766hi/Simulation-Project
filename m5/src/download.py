"""Fetch the M5 data set.

Kaggle's own endpoint needs an API token and competition acceptance; the M5 organisers
also redistribute the full data (including the private-leaderboard actuals and the
official series weights) and Nixtla mirrors that archive on GitHub. The official
scores of the benchmarks and top-50 teams come from the organisers' M5-methods repo.
"""
import io
import urllib.request
import zipfile

from config import RAW

M5_ZIP = "https://raw.githubusercontent.com/Nixtla/m5-forecasts/main/datasets/m5.zip"
SCORES = ("https://raw.githubusercontent.com/Mcompetitions/M5-methods/master/"
          "Scores%20and%20Ranks.xlsx")


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    if not (RAW / "sales_train_evaluation.csv").exists():
        print("downloading M5 archive (~50 MB)...")
        data = urllib.request.urlopen(M5_ZIP, timeout=600).read()
        zipfile.ZipFile(io.BytesIO(data)).extractall(RAW)
    if not (RAW / "scores.xlsx").exists():
        (RAW / "scores.xlsx").write_bytes(urllib.request.urlopen(SCORES, timeout=120).read())
    print("files:", sorted(p.name for p in RAW.iterdir()))


if __name__ == "__main__":
    main()
