type CoinInfoT = {
  name: string;
  color: string;
  icon: string;
  code: string;
};
type CoinDayDataT = {
  qty: number;
  value: number;
  profit: number;
  profit_percent: number;
  time: number;
  close: number;
};
type CoinDataT = {
  info: CoinInfoT;
  value: number;
  qty: number;
  profit: number;
  profit_percent: number;
  investment: number;
  data: CoinDayDataT[];
};
type OverviewT = {
  qty: number;
  value: number;
  profit: number;
};
type ChartsData = {
  coins: CoinDataT[];
  total: CoinDayDataT[];
  overview: OverviewT;
};
type HistoricalApiRespT = {
  status: boolean;
  data: ChartsData;
};
interface Window {
  Chart: any;
}

const parseDate: (time: number) => string = (time) => {
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const date = new Date(time);
  // const month = MONTHS[date.getMonth()];
  let month: string | number = date.getMonth() + 1;
  if (month < 10) month = "0" + month;
  let day: string | number = date.getUTCDate();
  if (day < 10) day = "0" + day;
  const year = date.getUTCFullYear();

  return `${day}/${month}`;
};
const parsePercentage: (n: number) => string = (n) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(n);
};

window.addEventListener("load", async () => {
  const baseUrl = "http://localhost:3000";
  const Chart = window.Chart;

  try {
    // fetching coins data
    const req = await fetch(`${baseUrl}/api/historical`);
    const resp: Awaited<HistoricalApiRespT> = await req.json();
    if (resp.status) {
      const { coins, total, overview } = resp.data;

      // setting up hero pie chart
      const heroCanvasEl = document.getElementById("hero-chart");
      const hoverEl = document.getElementById("hover");
      if (heroCanvasEl) {
        new Chart(heroCanvasEl, {
          type: "doughnut",
          data: {
            labels: coins.map((c) => c.info.name),
            datasets: [
              {
                label: "% of Portfolio",
                data: coins.map((c) => c.value / overview.value),
                backgroundColor: coins.map((c) => `rgb(${c.info.color})`),
                borderColor: coins.map((c) => `rgb(${c.info.color})`),
                // hoverBackgroundColor: "red",
                hoverBorderWidth: 10,
                borderWidth: 0,
                borderRadius: 0,
                borderJoinStyle: "mitter",
              },
            ],
          },
          options: {
            layout: {
              padding: 20,
            },
            events: ["mousemove", "mouseout"],
            onHover: function (a: any, b: any[]) {
              if (hoverEl) {
                if (b.length) {
                  hoverEl.classList.add("show");
                  const index: number = b[0].index;
                  hoverEl.textContent = coins[index].info.name;
                  hoverEl.style.backgroundColor = `rgba(${coins[index].info.color}, 0.5)`;
                  return;
                }
                hoverEl.classList.remove("show");
              }
            },
            scales: {
              y: {
                display: false,
              },
            },
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                },
              },
              tooltip: {
                position: "average",
                padding: 0,
                xAlign: "center",
                yAlign: "center",
                backgroundColor: "transparent",
                displayColors: false,
                bodyFont: {
                  size: 30,
                  weight: 700,
                  family: "Poppins",
                },
                callbacks: {
                  title: () => "",
                  label: (context: any) => {
                    return parsePercentage(context.raw);
                  },
                },
              },
              title: {
                display: true,
                text: "Major holdings",
                font: {
                  family: "Montserrat",
                  weight: 500,
                  size: 32,
                },
                color: "black",
              },
            },
          },
        });
      }

      // displaying top performing coins
      const coinsContainer = document.querySelector(".section .coins");
      if (coinsContainer) {
        coins.sort((c1, c2) => c2.profit - c1.profit);
        for (const coin of coins) {
          const coinEl = document.createElement("div");
          coinEl.className = "coin";
          coinEl.textContent = coin.info.code;
          coinEl.title = coin.info.name;

          coinEl.style.backgroundColor = `rgb(${coin.info.color})`;
          coinEl.style.boxShadow = `0 0 0 5px rgba(${coin.info.color}, 0.2)`;

          coinsContainer.appendChild(coinEl);
        }
      }

      // setting up individual coin's chart
      const listEl = document.getElementById("portfolio");
      if (listEl) {
        for (const coinData of coins) {
          // console.log(coinData.name, coinData);
          const { info: coinInfo, value, profit, profit_percent } = coinData;

          const detailsEl = document.createElement("details");
          detailsEl.style.backgroundColor = `rgba(${coinInfo.color}, 0.2)`;
          {
            const summaryEl = document.createElement("summary");
            {
              const infoEl = document.createElement("div");
              infoEl.className = "info";
              {
                const imgEl = document.createElement("img");
                imgEl.src = coinInfo.icon;

                const nameEl = document.createElement("h2");
                nameEl.textContent = coinInfo.name;

                infoEl.appendChild(imgEl);
                infoEl.appendChild(nameEl);
              }

              const valueEl = document.createElement("div");
              valueEl.className = "pl";
              valueEl.textContent = parsePercentage(value / overview.value);

              const plEl = document.createElement("div");
              plEl.className = "pl";
              const pl = profit / value;
              if (pl < 0) plEl.classList.add("loss");
              const symobl = pl < 0 ? "" : "+";
              plEl.textContent = symobl + parsePercentage(profit_percent / 100);

              summaryEl.appendChild(infoEl);
              summaryEl.appendChild(valueEl);
              summaryEl.appendChild(plEl);
            }

            const chartsContainer = document.createElement("div");
            chartsContainer.className = "charts-container";
            {
              const chartEl = document.createElement("canvas");
              chartsContainer.appendChild(chartEl);

              {
                new Chart(chartEl, {
                  type: "bar",
                  data: {
                    labels: coinData.data.map((d) => parseDate(d.time)),
                    datasets: [
                      {
                        label: "Percent. of portfolio",
                        data: coinData.data.map(
                          (d, i) => (d.value / total[i].value) * 100
                        ),
                        borderWidth: 1,
                        backgroundColor: "rgba(243, 145, 26, 0.4)",
                        borderColor: "rgba(243, 145, 26, 0.8)",
                      },
                      {
                        label: `Profit % on ${coinInfo.name}`,
                        data: coinData.data.map((d, i) =>
                          d.profit > 0 ? d.profit_percent : 0
                        ),
                        borderWidth: 1,
                        backgroundColor: "rgba(26, 243, 114, 0.5)",
                        borderColor: "rgba(26, 243, 114, 1)",
                      },
                      {
                        label: `Loss % on ${coinInfo.name}`,
                        data: coinData.data.map((d, i) =>
                          d.profit < 0 ? -d.profit_percent : 0
                        ),
                        borderWidth: 1,
                        backgroundColor: "rgba(238, 5, 5, 0.4)",
                        borderColor: "rgba(238, 5, 5, 1)",
                      },
                    ],
                  },
                  options: {
                    scales: {
                      x: {
                        stacked: true,
                        ticks: {
                          color: "rgba(47, 64, 243, 0.7)",
                          // display: false,
                        },
                        font: {
                          size: 10,
                          family: "Poppins",
                        },
                      },
                      y: {
                        stacked: true,
                        ticks: {
                          color: "rgba(47, 64, 243, 0.7)",
                        },
                        font: {
                          size: 10,
                          family: "Poppins",
                        },
                      },
                    },
                    layout: {
                      padding: 20,
                    },
                    barThickness: 10,
                    elements: {
                      bar: {
                        borderSkipped: false,
                      },
                    },
                    aspectRatio: 5,
                  },
                });
              }
            }

            detailsEl.appendChild(summaryEl);
            detailsEl.appendChild(chartsContainer);
          }

          listEl.appendChild(detailsEl);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});
