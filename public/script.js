let ch = document.querySelector("#ch");

ch.addEventListener("click", ()=>{
    const h2 = document.createElement("h2");
    h2.textContent = "Boooom! 💥💥";
    document.body.appendChild(h2);
});