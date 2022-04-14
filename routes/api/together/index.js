const router = require('express').Router();
const controller = require('./together.controller');

router.post('/matching', controller.matching);
router.get('/matching', controller.team);

module.exports = router


//유저추가 -> 랜덤하기직전 팀원모으는과정 post
//유저 추가시 서버에서 배열로 추가


//랜덤매칭 -> 서버내에서 배열에 있는 값들 랜덤으로 섞기 , 함수로구현

//매칭된 팀 디비에 추가 ->  post로 

