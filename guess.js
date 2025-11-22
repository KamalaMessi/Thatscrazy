(() => {

  const questions = [
    "Is this person an actor?",
    "Is this person older than 30?",
    "Is this person from US?",
    "Is this person well known on the internet?",
    "Is this person a business owner?",
    "Is this person controversial?",
    "Is this person?",
    "Is?"
  ];

  const qEl = document.getElementById("gqQ");
  const btnYes = document.getElementById("btnYes");
  const btnNo  = document.getElementById("btnNo");
  const btnIdk = document.getElementById("btnIdk");

  const resultBox = document.getElementById("gqResult");
  const quizBox   = document.getElementById("gqStep");

  const btnRight = document.getElementById("btnRight");
  const btnWrong = document.getElementById("btnWrong");
  const finalMsg = document.getElementById("gqFinalMsg");
  const playAgain = document.getElementById("playAgain");

  let step = 0;
  let usedIdk = false;

  function showQuestion(){
    qEl.textContent = questions[step];
  }

  function next(){
    step++;
    if(step >= questions.length){
      finishQuiz();
    } else {
      showQuestion();
    }
  }

  function finishQuiz(){
    quizBox.style.display = "none";
    resultBox.style.display = "block";

    //Achievement
    if (usedIdk && window.Ach && !Ach.has("idk_either")) {
      Ach.grant("idk_either");
    }
  }

  //answer buttons
  btnYes.onclick = () => next();
  btnNo.onclick  = () => next();

  btnIdk.onclick = () => {
    usedIdk = true;
    next();
  };

  //result buttons
  btnRight.onclick = () => {
    finalMsg.textContent = "Yeah im fucking awesome at ts 🙏";
    playAgain.style.display = "inline-block";
  };

  
//Elliot Alderson getting throwed in the water
  playAgain.onclick = () => {
    step = 0;
    usedIdk = false;
    finalMsg.textContent = "";
    playAgain.style.display = "none";
    quizBox.style.display = "block";
    resultBox.style.display = "none";
    showQuestion();
  };

  
  showQuestion();

})();
