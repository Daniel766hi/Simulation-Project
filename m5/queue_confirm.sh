#!/usr/bin/env bash
# Confirmation test for the stacked blend (src/stack_confirm.py): six new untouched windows, the
# same ten runs per window as queue_extended.sh. Newest window first. Writes its PID so the
# follow-up can wait on this process rather than on a name.
cd /home/user/Simulation-Project/m5/src
O=../outputs
echo $$ > $O/confirm.pid
V2='{"seed":7,"num_leaves":127,"feature_fraction":0.5,"bagging_seed":7,"feature_fraction_seed":7}'
WIN='{"min_data_in_leaf":4095,"feature_fraction":0.5,"bagging_fraction":0.5,"bagging_freq":1,"max_bin":100}'
run() {  # name, then train.py args
  local name=$1; shift
  [ -f $O/preds_$name.npy ] && return
  [ -f $O/STOP ] && { echo "$(date +%T) stopped" >> $O/confirm.log; exit 0; }
  echo "$(date +%T) start $name" >> $O/confirm.log
  python3 train.py "$@" > $O/run_$name.out 2>&1 \
    && echo "$(date +%T) done $name" >> $O/confirm.log || echo "$(date +%T) FAILED $name" >> $O/confirm.log
}
for o in 1577 1549 1521 1493 1465 1437; do
  run recursive2_store_o$o  --kind recursive --tag 2  --train-days 730 --params "$V2" --pool store --origin $o --rounds 800
  run mh_store_o$o          --kind mh                                             --pool store --origin $o --rounds 800
  run recursive2m_store_o$o --kind recursive --tag 2m --train-days 730 --params "$V2" --pool store --origin $o --rounds 800 --mask-stockouts
  run mhm_store_o$o         --kind mh --tag m                                     --pool store --origin $o --rounds 800 --mask-stockouts
  for kind in recursive direct; do
    for pool in store store_cat store_dept; do
      run ${kind}_win_${pool}_o$o --kind $kind --tag _win --no-scaling --pool $pool --origin $o --rounds 900 --params "$WIN"
    done
  done
  echo "$(date +%T) WINDOW $o DONE" >> $O/confirm.log
done
echo "$(date +%T) CONFIRM TRAINING DONE" >> $O/confirm.log
cd /home/user/Simulation-Project/m5/src && python3 stack_confirm.py test >> $O/confirm.log 2>&1 && echo "$(date +%T) CONFIRM TEST DONE" >> $O/confirm.log
