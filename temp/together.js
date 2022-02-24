const inputform = document.querySelector("#input-form");
const input = document.querySelector("#input-form input");
const intra = document.querySelector("#intra-id");
const btn = document.querySelector("#button");
const reset = document.querySelector("#reset");

const idArr = [];

function onSubmit(event){

	event.preventDefault();
	const name = input.value;
	idArr.push(name);
	console.log(name);
	input.value = "";
	console.log(idArr);
	intra.textContent=`${idArr} `;
	inputform.focus();
}

function shuffle(array){
	array.sort(()=> Math.random() - 0.5);
}

function onBtn(event){
	const teamName = ["집","현","전"];
	event.preventDefault();
	shuffle(idArr);
	console.log(idArr);
	const resultTag = document.querySelector("#result");
	for(let i = 0; i < Math.ceil(idArr.length/4); i++)
	{
		const team = document.createElement("span")
		team.className = "user";
		team.textContent = `${teamName[i]}`;
		resultTag.appendChild(team);

	}
	const br = document.createElement("div");
	resultTag.appendChild(br);
	for (let i = 0; i < idArr.length; i++) {
  	setTimeout(() => {
		  if(i % Math.ceil(idArr.length/4) == 0)
		  {
			const user = document.createElement("div");
			resultTag.appendChild(user);
		  }
		const user = document.createElement("span");
		user.className = "user";
		// colorize(winusers[i], user);
		user.textContent = idArr[i];
		resultTag.appendChild(user);
  		}, 1000 * (i + 1));
	}
}

function onReset(event){
	event.preventDefault();
	console.log("reset");
	const temp = document.querySelector("#result");
	while(temp.firstChild){
		temp.firstChild.remove();
	}
}
inputform.addEventListener("submit", onSubmit);
btn.addEventListener("click",onBtn);
reset.addEventListener("click",onReset);