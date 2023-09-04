type CoinT = {
  _id: string;
  name: string;
};
type FetchCoinsApiRespT = {
  status: true;
  msg: string;
  data: CoinT[];
};
type FormDataT = {
  coin: string;
  date: string;
  qty: number;
  price: number;
};
type AddTransactionApiRespT = {
  status: boolean;
  msg: string;
};

window.addEventListener("load", async () => {
  try {
    const sp = new URLSearchParams(window.location.search);
    const isTesting = sp.get("testing") === "true";
    const baseUrl = isTesting
      ? "http://localhost:3000"
      : "https://node.realacademy.io";

    let coins: CoinT[] = [];

    // fetching the coins
    const fetchCoinsReq = await fetch(`${baseUrl}/api/coins`);
    if (fetchCoinsReq.status === 200) {
      const fetchCoinsResp: Awaited<FetchCoinsApiRespT> =
        await fetchCoinsReq.json();

      if (fetchCoinsResp.status) coins = fetchCoinsResp.data;
      else throw new Error(fetchCoinsResp.msg);
    } else throw new Error(fetchCoinsReq.statusText);

    const formEl = document.getElementById("t-form") as HTMLFormElement;
    const selectEl = document.getElementById("coin") as HTMLSelectElement;
    const dateEl = document.getElementById("date") as HTMLInputElement;
    const qtyEl = document.getElementById("qty") as HTMLInputElement;
    const priceEl = document.getElementById("price") as HTMLInputElement;

    coins.forEach((coin) => {
      const { _id, name } = coin;
      const optionEl = document.createElement("option");
      optionEl.value = _id;
      optionEl.text = name;
      selectEl.appendChild(optionEl);
    });

    formEl.reset();
    const formData: FormDataT = {
      coin: "",
      date: "",
      qty: 0,
      price: 0,
    };

    selectEl.addEventListener("input", () => (formData.coin = selectEl.value));
    [dateEl, qtyEl, priceEl].forEach((el) => {
      el.addEventListener("change", () => {
        const { name: fieldName, type, value } = el;
        const fieldValue = type === "date" ? value : +value;

        formData[fieldName] = fieldValue;
      });
    });

    formEl.addEventListener("submit", async (ev) => {
      try {
        ev.preventDefault();

        const tReq = await fetch(`${baseUrl}/api/transaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const tResp: Awaited<AddTransactionApiRespT> = await tReq.json();
        alert(tResp.msg);
        formEl.reset();
        formData.coin = "";
        formData.date = "";
        formData.qty = 0;
        formData.price = 0;
      } catch (error) {
        console.error(error);
      }
    });
  } catch (error) {
    console.error(error);
  }
});
