#!/bin/bash

set -euo pipefail
# shellcheck disable=all

TOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck disable=SC1091
source "${TOP_DIR}/scripts/qbot_base.sh"

wget https://repo.continuum.io/archive/Anaconda3-5.3.1-Linux-x86_64.sh
bash Anaconda3-5.3.1-Linux-x86_64.sh

info "export PATH=/home/$USER/anaconda3/bin:$PATH" | sudo tee -a ~/.bashrc
# shellcheck disable=SC1090
source ~/.bashrc

conda info --env
conda create -n qbot python=3.9
conda activate qbot
conda info --env

pip install -r requirements.txt
pip install -U wxpy

# make sure if local device
if [[ $"(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]]; then
  set USER_ID="admin"                      # replace your info
  set PASSWORD="admin1234."                # replace your info
  set MAIL_LICENSE="wafasqtakgywoobach"    # replace your own 163.com / qq.com license
else                                       #Darwin or Linux
  export USER_ID="admin"                   # replace your info
  export PASSWORD="admin1234."             # replace your info
  export MAIL_LICENSE="wafasqtakgywoobach" # replace your own 163.com / qq.com license
  # 设置 tushare pro 访问令牌（请替换为你自己的 token）
  export TUSHARE_TOKEN="your_tushare_pro_token"
fi

info "Successful - Environment is set up!"

info "Enjoy, Qboter!"

echo -e "\e]8;;http://github.com/Charmve\aThis is Charmve's blog\e]8;;\a"
echo -e "\e[40;38;5;82m Alpha \e[30;48;5;82m Qbot \e[0m"

cat << EOF

             ██████╗ ██████╗  ██████╗ ████████╗
            ██╔═══██╗██╔══██╗██╔═══██╗╚══██╔══╝
            ██║   ██║██████╔╝██║   ██║   ██║
            ██║▄▄ ██║██╔══██╗██║   ██║   ██║
            ╚██████╔╝██████╔╝╚██████╔╝   ██║
             ╚══▀▀═╝ ╚═════╝  ╚═════╝    ╚═╝

                        Alpha Qbot
          ++++=================================++++
                 auth: Charmve   --V.0.1

   🤖 Qbot = 智能交易策略 + 回测系统 + 自动化交易 (+ 可视化分析工具)
                |           |          |            |
                |           |          |             \_ quantstats (dashboard\online operate)
                |           |           \______________ Qbot - vnpy, pytrader, pyfunds
                |           \__________________________ BackTest - backtrader, easyquant
                \______________________________________ quant.ai - qlib, deep learning strategies
EOF

info "Run example backtest"
cd pytrader
python test_backtrade.py # run backtest
# python test_trader.py # run real trader test

# run python app
# make sure if local device
if [[ "$(uname)" == "Darwin" ]]; then
  info "run on MacOS"
  pythonw main.py
  # server_ip=$(ifconfig en0|grep "inet "|awk '{print $2}'|awk -F: '{print $1}')
# shellcheck disable=SC2308
elif [[ "$(expr substr "$(uname -s)" 1 5)" == "Linux" ]]; then
  python main.py
  # server_ip=$(ifconfig eth0|grep "inet addr"|awk '{print $2}'|awk -F: '{print $2}')
# shellcheck disable=SC2308
elif [[ "$(expr substr "$(uname -s)" 1 10)" == "MINGW32_NT" ]]; then
  warning "not support on WinOS."
fi

exit 0
