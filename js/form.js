window.addEventListener("load", async () => {
    try {
        const sp = new URLSearchParams(window.location.search);
        const isTesting = sp.get("testing") === "true";
        const baseUrl = isTesting
            ? "http://localhost:3000"
            : "https://node.realacademy.io";
        let coins = [];
        // fetching the coins
        const fetchCoinsReq = await fetch(`${baseUrl}/api/coins`);
        if (fetchCoinsReq.status === 200) {
            const fetchCoinsResp = await fetchCoinsReq.json();
            if (fetchCoinsResp.status)
                coins = fetchCoinsResp.data;
            else
                throw new Error(fetchCoinsResp.msg);
        }
        else
            throw new Error(fetchCoinsReq.statusText);
        const formEl = document.getElementById("t-form");
        const selectEl = document.getElementById("coin");
        const dateEl = document.getElementById("date");
        const qtyEl = document.getElementById("qty");
        const priceEl = document.getElementById("price");
        coins.forEach((coin) => {
            const { _id, name } = coin;
            const optionEl = document.createElement("option");
            optionEl.value = _id;
            optionEl.text = name;
            selectEl.appendChild(optionEl);
        });
        formEl.reset();
        const formData = {
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
                const tResp = await tReq.json();
                alert(tResp.msg);
                formEl.reset();
                formData.coin = "";
                formData.date = "";
                formData.qty = 0;
                formData.price = 0;
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    catch (error) {
        console.error(error);
    }
});
