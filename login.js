let studentusername = document.getElementById("username");
let studbutton = document.getElementById("button");
let studentpassword = document.getElementById("passowrd");

studbutton.addEventListener("click", () => {
  let studvalue = studentusername.value;
  if (isNaN(studvalue)) {
    alert("Enter Valid Registration Number");
  }
});
