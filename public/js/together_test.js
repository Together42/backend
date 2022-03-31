const inputform = document.querySelector("#input-form");
const input = document.querySelector("#input-form input");
const intra = document.querySelector("#intra-id");
const teamNumPrint = document.querySelector("#team-num");
const btn = document.querySelector("#button");
const reset = document.querySelector("#reset");
const teamNInput = document.querySelector("#input-form-team input");
const inputFormTeam = document.querySelector("#input-form-team");
const idArr = [];
let teamNum = 4;

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

function onTeamNSubmit(event){

	event.preventDefault();
	const num = teamNInput.value;
	teamNum = num;
	console.log(num);
	teamNumPrint.textContent=` : ${teamNum} `;
}

function shuffle(array){
	array.sort(()=> Math.random() - 0.5);
}

function onBtn(event){//랜덤매칭
	let teamName = [];
	const teamName2 = ["사","이"];
	const teamName3 = ["집","현","전"];
	const teamName4 = ["사","이","서","울"];
	if(teamNum == 2)
		teamName = teamName2;
	else if(teamNum == 3)
		teamName = teamName3;
	else if(teamNum == 4)
		teamName = teamName4;
	else{
		console.log(teamName);
		for(let i = 1; i <= parseInt(teamNum); i++)
		{
			teamName.push(`${i}팀`);
		}
	}
	event.preventDefault();
	console.log(`team : ${teamName}`);
	shuffle(idArr);
	console.log(idArr);
	const resultTag = document.querySelector("#result");
	for(let i = 0; i < teamNum; i++)
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
		  if(i % teamNum == 0)
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
inputFormTeam.addEventListener("submit", onTeamNSubmit);