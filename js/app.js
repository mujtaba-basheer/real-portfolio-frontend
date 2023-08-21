const socket = io("http://localhost:5000");

const ctx = document.getElementById("charts");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Close",
        data: [],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
      },
    ],
  },
  options: {
    scales: {
      y: {
        // min: 0,
      },
      x: {
        title: "Time",
      },
    },
  },
});

socket.on("data", (data) => {
  const { E: e, c } = data;
  console.log(`Received: {e: ${e}, c: ${c}}`);
  const date = new Date(e);
  console.log(date);
  if (chart.data.labels.length < 10) {
    chart.data.labels.push(e);
    chart.data.datasets[0].data.push(c);
  } else {
    chart.data.labels.shift();
    chart.data.labels.push(e);

    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(c);
  }

  chart.update("none");
});
