#!/usr/bin/env bash
# Roadmap step 1: six more untouched windows. Per window: our two weighted members (plain and
# stock-out masked), then the winner's six components. Newest window first.
cd /home/user/Simulation-Project/m5/src
O=../outputs
V2='{"seed":7,"num_leaves":127,"feature_fraction":0.5,"bagging_seed":7,"feature_fraction_seed":7}'
WIN='{"min_data_in_leaf":4095,"feature_fraction":0.5,"bagging_fraction":0.5,"bagging_freq":1,"max_bin":100}'
run() {  # name, then train.py args
  local name=$1; shift
  [ -f $O/preds_$name.npy ] && return
  [ -f $O/STOP ] && { echo "$(date +%T) stopped" >> $O/queue.log; exit 0; }
  echo "$(date +%T) start $name" >> $O/queue.log
  python3 train.py "$@" > $O/run_$name.out 2>&1 \
    && echo "$(date +%T) done $name" >> $O/queue.log || echo "$(date +%T) FAILED $name" >> $O/queue.log
}
for o in 1745 1717 1689 1661 1633 1605; do
  run recursive2_store_o$o  --kind recursive --tag 2  --train-days 730 --params "$V2" --pool store --origin $o --rounds 800
  run mh_store_o$o          --kind mh                                             --pool store --origin $o --rounds 800
  run recursive2m_store_o$o --kind recursive --tag 2m --train-days 730 --params "$V2" --pool store --origin $o --rounds 800 --mask-stockouts
  run mhm_store_o$o         --kind mh --tag m                                     --pool store --origin $o --rounds 800 --mask-stockouts
  for kind in recursive direct; do
    for pool in store store_cat store_dept; do
      run ${kind}_win_${pool}_o$o --kind $kind --tag _win --no-scaling --pool $pool --origin $o --rounds 900 --params "$WIN"
    done
  done
  echo "$(date +%T) WINDOW $o DONE" >> $O/queue.log
done
echo "$(date +%T) EXTENDED DONE" >> $O/queue.log
