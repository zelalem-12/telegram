let current_channel = "";
let channelChart;
window.addEventListener("load", getChannelData);
let interval = window.setInterval(getChannelData, 10000, false);

function getChannelData() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://subseth.herokuapp.com/api/subscribers", true);
  xhr.onload = function () {
    if (this.status === 200) {
      let subscriber_data = JSON.parse(this.responseText);
      current_channel = subscriber_data[0]
        ? `https://t.me/${subscriber_data[0].link}`
        : "";
      document.getElementById("channel_name").innerHTML = current_channel;
      const dataRange = subscriber_data.reduce(
        (accumulator, currentValue) => {
          return [
            Math.min(currentValue.subs, accumulator[0]),
            Math.max(currentValue.subs, accumulator[1]),
          ];
        },
        [Number.MAX_VALUE, Number.MIN_VALUE]
      );
      if (channelChart) {
        channelChart.destroy();
      }
      const chartContainer = document.getElementById("canvas").getContext("2d");
      channelChart = new Chart(chartContainer, {
        type: "line",
        data: {
          labels: subscriber_data.map((data) =>
            new Date(data.created_at).toDateString()
          ),
          datasets: [
            {
              label: "# of subscriber",
              data: subscriber_data.map((data) => data.subs),
              backgroundColor: "transparent",
              borderColor: "CACACA",
              borderWidth: 1,
            },
          ],
        },
        options: {
          // plugins: {
          //   title: {
          //     display: true,
          //     text: `Real time subscribers count for ${"inputvalue"}`,
          //   },
          // },
          scales: {
            y: {
              beginAtZero: true,
              min: dataRange[0] * 0.99,
              max: dataRange[1] * 1.01,
            },
            //   x: {
            //     type: "time",
            //   },
          },
        },
      });

      console.log({ subscriber_data });
    }
  };
  xhr.onerror = function (e) {
    console.log(e);
  };
  xhr.send();
}

const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
searchButton.addEventListener("click", updateChannel);

searchInput.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("search-button").click();
  }
});

function updateChannel() {
  clearInterval(interval);
  console.log(searchInput.value);
  let channelName = searchInput.value;

  const data = {
    channelName: channelName.split("/")[channelName.split("/").length - 1],
  };
  console.log({ data });

  if (channelName) {
    if (
      channelName.startsWith("https://t.me/") ||
      channelName.startsWith("http://t.me/")
    ) {
      channelName = channelName.split("https://t.me/")[1];
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://subseth.herokuapp.com/api/change-channel", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        interval = window.setInterval(getChannelData, 10000, true);
        console.log(response);
      }
    };
    xhr.send(JSON.stringify(data));
  }
}
