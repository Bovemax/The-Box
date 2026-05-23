const textbox = document.getElementById("textbox");
const button = document.getElementById("show-btn");

button.addEventListener("click", () => {
    textbox.classList.toggle("show");
});