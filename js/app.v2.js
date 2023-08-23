const parseDate = (time, includeName) => {
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
  let month = includeName ? MONTHS[date.getMonth()] : date.getMonth() + 1;
  if (typeof month === "number" && month < 10) month = "0" + month;
  let day = date.getUTCDate();
  if (day < 10) day = "0" + day;
  const year = date.getUTCFullYear();
  return includeName ? `${day} ${month}, ${year}` : `${month}/${day}`;
};
const parsePercentage = (n) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(n);
};
const getCoinChartConfig = () => {
  let aspectRatio = 1036 / 350;
  let padding = 20;
  let legendBoxWidth = 40;

  const viewportWidth = window.innerWidth;
  if (viewportWidth < 640) {
    aspectRatio = 1;
    padding = 15;
    legendBoxWidth = 15;
  }

  const getLegendTitles = (coinName) => {
    if (viewportWidth < 640) {
      return {
        inv: "% of Portfolio",
        prf: "Profit %",
        lss: "Loss %",
      };
    }
    return {
      inv: "Percent of portfolio",
      prf: "Profit % on " + coinName,
      lss: "Loss % on " + coinName,
    };
  };

  return {
    aspectRatio,
    padding,
    legendBoxWidth,
    getLegendTitles,
  };
};

window.addEventListener("load", async () => {
  const baseUrl = "https://node.realacademy.io";
  const Chart = window.Chart;
  try {
    // fetching coins data
    const req = await fetch(`${baseUrl}/api/historical`);
    const resp = await req.json();
    if (resp.status) {
      const { coins, total, overview } = resp.data;
      coins.sort((c1, c2) => c2.value - c1.value);

      // setting up hero pie chart
      {
        const pieChartData = [];
        for (let i = 0; i < 4; i++) {
          if (i < 3) pieChartData.push(coins[i]);
          else if (!pieChartData[i]) {
            pieChartData.push({
              info: {
                name: "Others",
                color: "187, 239, 255",
              },
              value: coins[i].value,
            });
          } else {
            pieChartData[3].value += coins[i].value;
          }
        }
        const heroCanvasEl = document.getElementById("hero-chart");
        const hoverEl = document.getElementById("hover");
        if (heroCanvasEl) {
          if (window.innerWidth < 1020) {
            new Chart(heroCanvasEl, {
              type: "bar",
              data: {
                labels: [""],
                datasets: pieChartData.map((c) => ({
                  label: c.info.name,
                  data: [c.value / overview.value],
                  backgroundColor: [`rgb(${c.info.color})`],
                  borderColor: [`rgb(${c.info.color})`],
                })),
              },
              options: {
                responsive: true,
                barThickness: 30,
                indexAxis: "y",
                layout: {
                  padding: 0,
                  autoPadding: false,
                },
                scales: {
                  x: {
                    stacked: true,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    stacked: true,
                    display: false,
                    beginAtZero: true,
                    ticks: {
                      display: false,
                      padding: 0,
                    },
                    grid: {
                      display: false,
                    },
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
                  title: {
                    display: true,
                    text: "Major holdings",
                    font: {
                      family: "Montserrat",
                      weight: 500,
                      size: 20,
                    },
                    color: "black",
                    padding: 0,
                  },
                  tooltip: {
                    enabled: false,
                  },
                },
                // aspectRatio: window.innerWidth < 700 ? 2 : 4,
                aspectRatio: window.innerWidth / 200,
              },
            });
          } else {
            new Chart(heroCanvasEl, {
              type: "doughnut",
              data: {
                labels: pieChartData.map((c) => c.info.name),
                datasets: [
                  {
                    label: "% of Portfolio",
                    data: pieChartData.map((c) => c.value / overview.value),
                    backgroundColor: pieChartData.map(
                      (c) => `rgb(${c.info.color})`
                    ),
                    borderColor: pieChartData.map(
                      (c) => `rgb(${c.info.color})`
                    ),
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
                onHover: function (a, b) {
                  if (hoverEl) {
                    if (b.length) {
                      hoverEl.classList.add("show");
                      const index = b[0].index;
                      hoverEl.textContent = pieChartData[index].info.name;
                      hoverEl.style.backgroundColor = `rgba(${pieChartData[index].info.color}, 0.5)`;
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
                      label: (context) => {
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
        }
      }

      // displaying top performing coins
      {
        const coinsContainer = document.querySelector(".p-section .coins");
        if (coinsContainer) {
          coins.sort((c1, c2) => c2.profit - c1.profit);
          const topCoins = coins.slice(0, 5);
          for (const coin of topCoins) {
            const coinEl = document.createElement("div");
            coinEl.className = "coin";
            coinEl.textContent = coin.info.code;
            coinEl.title = coin.info.name;
            coinEl.style.backgroundColor = `rgb(${coin.info.color})`;
            coinEl.style.boxShadow = `0 0 0 5px rgba(${coin.info.color}, 0.2)`;
            coinsContainer.appendChild(coinEl);
          }
        }
      }

      // setting up individual coin's chart
      const headingEl = document.querySelector(".p-heading");
      if (headingEl && window.innerWidth < 844) {
        headingEl.textContent = "% of portfolio";
      }
      const listEl = document.getElementById("portfolio");
      if (listEl) {
        const coinChartConfig = getCoinChartConfig();
        const { getLegendTitles } = coinChartConfig;
        for (const coinData of coins) {
          // console.log(coinData.name, coinData);
          const { info: coinInfo, value, profit, profit_percent } = coinData;
          const legendTitles = getLegendTitles(coinInfo.name);
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
                    // labels: coinData.data.map((d) => parseDate(d.time)),
                    labels: coinData.data.map((d) => d.time),
                    datasets: [
                      {
                        label: legendTitles.inv,
                        data: coinData.data.map(
                          (d, i) => (d.value / total[i].value) * 100
                        ),
                        borderWidth: 1,
                        backgroundColor: "rgba(243, 145, 26, 0.4)",
                        borderColor: "rgba(243, 145, 26, 0.8)",
                      },
                      {
                        label: legendTitles.prf,
                        data: coinData.data.map((d, i) =>
                          d.profit > 0 ? d.profit_percent : 0
                        ),
                        borderWidth: 1,
                        backgroundColor: "rgba(26, 243, 114, 0.5)",
                        borderColor: "rgba(26, 243, 114, 1)",
                      },
                      {
                        label: legendTitles.lss,
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
                          display: true,
                          major: true,
                          callback: function (value, index) {
                            if (index % 3 === 0) {
                              return parseDate(coinData.data[index].time);
                            }
                            return "";
                          },
                          autoSkip: true,
                          sampleSize: 60,
                          maxRotation: 0,
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
                      padding: coinChartConfig.padding,
                    },
                    // barThickness: 10,
                    elements: {
                      bar: {
                        borderSkipped: false,
                        barPercentage: 1,
                        categoryPercentage: 1,
                      },
                    },
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          boxWidth: coinChartConfig.legendBoxWidth,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          title: (arg) => parseDate(+arg[0].label, true),
                        },
                      },
                    },
                    aspectRatio: coinChartConfig.aspectRatio,
                  },
                  plugins: [],
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
