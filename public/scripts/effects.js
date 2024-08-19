if(document.querySelector(".submitButton")){
  let btn = document.querySelector(".submitButton");

btn.addEventListener("click", active);

function active() {
  btn.classList.toggle("is_active");
}
}
if(document.querySelector("#searchList"))
{
  document.querySelectorAll("#searchListRow").forEach((item)=>{item.addEventListener("click", ()=>{
    item.querySelector(".form").submit()
  })
})}

const elts = {
  text1: document.getElementById("text1"),
  text2: document.getElementById("text2")
};

const texts = [
  "Read",
  "Reflect",
  "Review",
  ":)",
  "by @Ani"
];

const morphTime = 1;
const cooldownTime = 0.25;

let textIndex = texts.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;

elts.text1.textContent = texts[textIndex % texts.length];
elts.text2.textContent = texts[(textIndex + 1) % texts.length];

function doMorph() {
  morph -= cooldown;
  cooldown = 0;

  let fraction = morph / morphTime;

  if (fraction > 1) {
      cooldown = cooldownTime;
      fraction = 1;
  }

  setMorph(fraction);
}

function setMorph(fraction) {
  elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
  elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

  fraction = 1 - fraction;
  elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
  elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

  elts.text1.textContent = texts[textIndex % texts.length];
  elts.text2.textContent = texts[(textIndex + 1) % texts.length];
}

function doCooldown() {
  morph = 0;

  elts.text2.style.filter = "";
  elts.text2.style.opacity = "100%";

  elts.text1.style.filter = "";
  elts.text1.style.opacity = "0%";
}

function animate() {
  requestAnimationFrame(animate);

  let newTime = new Date();
  let shouldIncrementIndex = cooldown > 0;
  let dt = (newTime - time) / 1000;
  time = newTime;

  cooldown -= dt;

  if (cooldown <= 0) {
      if (shouldIncrementIndex) {
          textIndex++;
      }

      doMorph();
  } else {
      doCooldown();
  }
}

animate();

if(document.getElementById("shortByButtons"))
{
  var orderBy = document.getElementById("shortByButtons").getAttribute("orderBy");
  document.getElementById("shortByButtons").querySelectorAll(".orderButton").forEach(item=>{
    item.classList.remove("shortingButtonSelected");
  })
  document.getElementById(orderBy).classList.add("shortingButtonSelected");
}