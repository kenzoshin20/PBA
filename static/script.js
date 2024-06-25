var modal = document.getElementById("myModal");
var btn = document.getElementById("myButton");
var span = document.getElementsByClassName("close")[0];
btn.onclick = function() {
    modal.style.display = "block";
}
span.onclick = function() {
    modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
document.getElementById('rejard').innerHTML = `
<iframe src="http://fi3.bot-hosting.net:23173/" frameborder="0"></iframe>`;