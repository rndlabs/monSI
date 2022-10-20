// These constants drive the environment to monitor
const rpcURL = "ws://192.168.10.110:8547"

const redistributionContract = "0xF4963031E8b9f9659CB6ed35E53c031D76480EAD"
const stakeRegistryContract = "0x18391158435582D5bE5ac1640ab5E2825F68d3a4"
const gBZZTokenContract = "0x2aC3c1d3e24b45c6C310534Bc2Dd84B5ed576335"

const RedistributionABI = [{"inputs":[{"internalType":"address","name":"staking","type":"address"},{"internalType":"address","name":"postageContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_count","type":"uint256"}],"name":"CountCommits","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_count","type":"uint256"}],"name":"CountReveals","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"l","type":"string"}],"name":"Log","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"l","type":"string"},{"indexed":false,"internalType":"bytes32","name":"b","type":"bytes32"}],"name":"LogBytes32","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"hash","type":"bytes32"},{"indexed":false,"internalType":"uint8","name":"depth","type":"uint8"}],"name":"TruthSelected","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"anonymous":false,"inputs":[{"components":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"overlay","type":"bytes32"},{"internalType":"uint256","name":"stake","type":"uint256"},{"internalType":"uint256","name":"stakeDensity","type":"uint256"},{"internalType":"bytes32","name":"hash","type":"bytes32"},{"internalType":"uint8","name":"depth","type":"uint8"}],"indexed":false,"internalType":"struct Redistribution.Reveal","name":"winner","type":"tuple"}],"name":"WinnerSelected","type":"event"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PAUSER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PostageContract","outputs":[{"internalType":"contract PostageStamp","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"Stakes","outputs":[{"internalType":"contract StakeRegistry","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_obfuscatedHash","type":"bytes32"},{"internalType":"bytes32","name":"_overlay","type":"bytes32"}],"name":"commit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currentClaimRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentCommitRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"currentCommits","outputs":[{"internalType":"bytes32","name":"overlay","type":"bytes32"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"stake","type":"uint256"},{"internalType":"bytes32","name":"obfuscatedHash","type":"bytes32"},{"internalType":"bool","name":"revealed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentPhaseClaim","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentPhaseCommit","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentPhaseReveal","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentRevealRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"currentReveals","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"overlay","type":"bytes32"},{"internalType":"uint256","name":"stake","type":"uint256"},{"internalType":"uint256","name":"stakeDensity","type":"uint256"},{"internalType":"bytes32","name":"hash","type":"bytes32"},{"internalType":"uint8","name":"depth","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentRoundAnchor","outputs":[{"internalType":"bytes32","name":"returnVal","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentRoundReveals","outputs":[{"components":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"overlay","type":"bytes32"},{"internalType":"uint256","name":"stake","type":"uint256"},{"internalType":"uint256","name":"stakeDensity","type":"uint256"},{"internalType":"bytes32","name":"hash","type":"bytes32"},{"internalType":"uint8","name":"depth","type":"uint8"}],"internalType":"struct Redistribution.Reveal[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentSeed","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"A","type":"bytes32"},{"internalType":"bytes32","name":"B","type":"bytes32"},{"internalType":"uint8","name":"minimum","type":"uint8"}],"name":"inProximity","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"overlay","type":"bytes32"},{"internalType":"uint8","name":"depth","type":"uint8"}],"name":"isParticipatingInUpcomingRound","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_overlay","type":"bytes32"}],"name":"isWinner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minimumStake","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextSeed","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_overlay","type":"bytes32"},{"internalType":"uint8","name":"_depth","type":"uint8"},{"internalType":"bytes32","name":"_hash","type":"bytes32"},{"internalType":"bytes32","name":"_revealNonce","type":"bytes32"}],"name":"reveal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"roundLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"overlay","type":"bytes32"},{"internalType":"uint256","name":"stake","type":"uint256"},{"internalType":"uint256","name":"stakeDensity","type":"uint256"},{"internalType":"bytes32","name":"hash","type":"bytes32"},{"internalType":"uint8","name":"depth","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_overlay","type":"bytes32"},{"internalType":"uint8","name":"_depth","type":"uint8"},{"internalType":"bytes32","name":"_hash","type":"bytes32"},{"internalType":"bytes32","name":"revealNonce","type":"bytes32"}],"name":"wrapCommit","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"}]
const StakeRegistryABI = [{"inputs":[{"internalType":"address","name":"_bzzToken","type":"address"},{"internalType":"uint64","name":"_NetworkId","type":"uint64"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"slashed","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"StakeFrozen","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"slashed","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"StakeSlashed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"overlay","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"stakeAmount","type":"uint256"},{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"lastUpdatedBlock","type":"uint256"}],"name":"StakeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PAUSER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REDISTRIBUTOR_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"bzzToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"overlay","type":"bytes32"},{"internalType":"uint256","name":"time","type":"uint256"}],"name":"freezeDeposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"overlay","type":"bytes32"}],"name":"lastUpdatedBlockNumberOfOverlay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"overlay","type":"bytes32"}],"name":"ownerOfOverlay","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pot","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"overlay","type":"bytes32"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"slashDeposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"overlay","type":"bytes32"}],"name":"stakeOfOverlay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"stakes","outputs":[{"internalType":"bytes32","name":"overlay","type":"bytes32"},{"internalType":"uint256","name":"stakeAmount","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"lastUpdatedBlockNumber","type":"uint256"},{"internalType":"bool","name":"isValue","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"unPause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"overlay","type":"bytes32"}],"name":"usableStakeOfOverlay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"overlay","type":"bytes32"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawFromStake","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const gBZZTokenABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"sender","type":"address"},{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"cap","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"account","type":"address"},{"name":"amount","type":"uint256"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"account","type":"address"},{"name":"amount","type":"uint256"}],"name":"burnFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"account","type":"address"}],"name":"addMinter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceMinter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"isMinter","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint8"},{"name":"_cap","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"account","type":"address"}],"name":"MinterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"account","type":"address"}],"name":"MinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]

const blocksPerRound = 152

const preloadRounds = 4		// Startup can take a LONG time if you make this large!

const myOverlays = ["0xdf6c1b18cc21d07e0b89b05d16153002037f76982709ff879f2e6d60de7d2127",
					"0xe1dc994c4a8ba82c183cd9b773210d7c88061c507fb9a9dfcbccea04b8380134",
					"0x7cd1aa0441c0624b9e7d10c0c06c6de184c1bbe69c8c6c151bede80c4ecea8b2",
					"0x86d7a00d43cbb9810b85031cb655ce073ab99acf78956520e0b287c847424249"]


//import blessed from 'blessed';
const blessed = require('blessed')

function isUndefined(value){
    // Obtain `undefined` value that's
    // guaranteed to not have been re-assigned
    var undefined = void(0);
    return value === undefined;
}

function specificLocalTime(when)
{
	return when.toLocaleTimeString('en-GB')	// en-GB gets a 24hour format, but amazingly local time!
}

function currentLocalTime()
{
	return specificLocalTime(new Date())
}

function shortID(id, n)
{
	if (typeof(id) != 'string') return id
	if (id.substring(0,2) == '0x') id = id.substring(2)
	if (id.length <= n*2) return id
	return id.substring(0,n)+".."+id.substring(id.length-n)
}

function leftID(id, n)
{
	if (typeof(id) != 'string') return id
	if (id.substring(0,2) == '0x') id = id.substring(2)
	if (id.length <= n) return id
	return id.substring(0,n-3)+"..."
}

function shortNum(n,plus)
{
	if (typeof(n) != "number") return typeof(n)+'('+n+')'
	
	var negative, result
	if (n < 0)
	{	negative = true
		n = -n
	}

	//if (n >= 100*1000*1000*1000*1000*1000)
	//	result = (n/(1000*1000*1000*1000*1000)).toFixed(0)+'q'
	//else if (n >= 10*1000*1000*1000*1000*1000)
	//	result = (n/(1000*1000*1000*1000*1000)).toFixed(1)+'q'
	//else if (n >= 1*1000*1000*1000*1000*1000)
	//	result = (n/(1000*1000*1000*1000*1000)).toFixed(2)+'q'

	//else
	if (n >= 100*1000*1000*1000*1000)
		result = (n/(1000*1000*1000*1000)).toFixed(0)+'t'
	else if (n >= 10*1000*1000*1000*1000)
		result = (n/(1000*1000*1000*1000)).toFixed(1)+'t'
	else if (n >= 1*1000*1000*1000*1000)
		result = (n/(1000*1000*1000*1000)).toFixed(2)+'t'

	else if (n >= 100*1000*1000*1000)
		result = (n/(1000*1000*1000)).toFixed(0)+'b'
	else if (n >= 10*1000*1000*1000)
		result = (n/(1000*1000*1000)).toFixed(1)+'b'
	else if (n >= 1*1000*1000*1000)
		result = (n/(1000*1000*1000)).toFixed(2)+'b'

	else if (n >= 100*1000*1000)
		result = (n/(1000*1000)).toFixed(0)+'m'
	else if (n >= 10*1000*1000)
		result = (n/(1000*1000)).toFixed(1)+'m'
	else if (n >= 1*1000*1000)
		result = (n/(1000*1000)).toFixed(2)+'m'

	else if (n >= 100*1000)
		result = (n/(1000)).toFixed(0)+'k'
	else if (n >= 10*1000)
		result = (n/(1000)).toFixed(1)+'k'
	else if (n >= 1*1000)
		result = (n/(1000)).toFixed(2)+'k'
		
	else result = ''+n
	
	if (negative) result = "-"+result
	else if (plus) result = "+"+result
	return result
}

var screen = blessed.screen({
  smartCSR: true,
  dockBorders : true,
});

screen.title = 'monSI';

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});


var boxCount = 0
var boxes = []	// for focus tabbing
var boxFocus = 0
var boxColors = [ 'white', 'blue', 'red', 'green', 'magenta', 'yellow' ]
var boxWidth = 45

screen.key(['tab'], function (ch, key) {
	boxes[boxFocus].style.border.fg = 'white'
	boxFocus = (boxFocus+1)%boxCount
	boxes[boxFocus].style.border.fg = 'green'
	screen.render()
})

var numWidth = 3		// This is horizontal boxes
var numLines = 10		// This is per box

function createBox(URL)
{

// Create a box for the node
	var box = blessed.box({
	  parent: screen,
	  mouse: true,
	  keys: true,
	  vi: true,
	  left: (boxCount%numWidth)*boxWidth,
	  top: Math.trunc(boxCount/numWidth)*(numLines+1),
	  width: boxWidth+1,
	  height: (numLines+2),
	  content: '{center}'+URL+'{/center}',
	  tags: true,
	  border: {
		type: 'line'
	  },
	  style: {
		fg: 'brightwhite',
		bg: 'black',	// Was magenta
		border: {
		  fg: '#f0f0f0'
		},
		hover: {
		  bg: 'green'
		}
	  }
	});

	// Append our box to the screen.
	screen.append(box);

	// Focus our element.
	box.focus();
	boxFocus = boxCount	// index of focussed box
	boxes[boxCount] = box	// For later focus tabbing
	
box.key(['c'], function (ch, key) {
	showError(JSON.stringify(ch)+' Got key '+JSON.stringify(key))
})

	boxCount = boxCount + 1

	return box
}

var playersBox, roundsBox, winnersBox, outputBox

function addBoxes()
{

	winnersBox = blessed.box({
		
	  title: "Winners",
	  label: "Winners",
	  
	  top: 0,
	  left: '75%',
	  //left: numWidth*boxWidth,
	  //width: '100%-'+(numWidth*boxWidth),
	  width: '25%',
	  height: '100%',

	  content: '\n{center}'+rpcURL+'{/center}', // \n\n\nThreshold: '+shortNum(0)+'\nEarly:     '+shortNum(10)+'\nTrigger:   '+shortNum(100)+'\nBalance {cyan-fg}99%{/cyan-fg}: ~{cyan-fg}'+shortNum((100) * 0.99)+'{/cyan-fg}\nBalance {yellow-fg}98%{/yellow-fg}: ~{yellow-fg}'+shortNum((100) * 0.98)+'{/yellow-fg}',
	  scrollable: true,
	  tags: true,
	  border: {
		type: 'line'
	  },
	  style: {
		fg: 'brightwhite',
		bg: 'black',	// Was magenta
		border: {
		  fg: '#f0f0f0'
		},
		hover: {
		  bg: 'green'
		}
	  }
	});

	screen.append(winnersBox);

	roundsBox = blessed.box({
		
	  title: "Rounds",
	  label: "Rounds",
	  
	  top: 0,
	  left: '40%',
	  width: '35%',
	  height: '75%',

	  //content: '\nhh:mm:ss 51316(83) 1-1 1 df6c1b18c... ^2 +7.99t\nhh:mm:ss 51315(83) 4-4 4 828bec020... ^2 +8.04t\nhh:mm:ss 51314(82) 4-4 1+1+1+1=3 179ef3b3b... ^1 +7.89t',
	  content: '',
	  scrollable: true,
	  tags: true,
	  border: {
		type: 'line'
	  },
	  style: {
		fg: 'brightwhite',
		bg: 'black',	// Was magenta
		border: {
		  fg: '#f0f0f0'
		},
		hover: {
		  bg: 'green'
		}
	  }
	});

	screen.append(roundsBox);

	playersBox = blessed.box({
		
	  title: "Players",
	  label: "Players",
	  
	  top: 0,
	  left: 0,
	  width: '40%',
	  height: '75%',

	  //content: '\n22:34:01 51316(83) Player df6c1b18cc21d... claim 2 dc40224af7b1f5fc..a44c5debadc74b75\n22:33:52 51316(45) Player df6c1b18cc21d... reveal 2 dc40224af7b1f5fc..a44c5debadc74b75\n22:33:43 51316(11) Player df6c1b18cc21d... commit 0 5b46e618471c9f32..97ec95dce6876f8a',
	  content: '',
	  scrollable: false,
	  tags: true,
	  border: {
		type: 'line'
	  },
	  style: {
		fg: 'brightwhite',
		bg: 'black',	// Was magenta
		border: {
		  fg: '#f0f0f0'
		},
		hover: {
		  bg: 'green'
		}
	  }
	});

	screen.append(playersBox);

	outputBox = blessed.box({
	  //top: Math.trunc((boxCount+numWidth-1)/numWidth)*(numLines+1)+1,
	  //left: 0,
	  //width: numWidth*boxWidth,
	  //height: '100%',
	  top: '75%',
	  left: 0,
	  width: '75%',
	  height: '100%',
	  content: '{left}error and trace\noutput will appear here\nand scroll down{/left}',
	  scrollable: true,
	  tags: true,
	  style: {
		fg: 'white',
		bg: 'black',	// Was magenta
		border: {
		  fg: '#f0f0f0'
		},
		hover: {
		  bg: 'green'
		}
	  }
	});

	screen.append(outputBox);
}


var winnersBoxStatus = "" //"{yellow-fg}starting{/yellow-fg}"
var winnersBoxChecks = 0
var winnersBoxGasPrice = ""

function refreshWinnersTitle()
{
	var checks = ""
	if (winnersBoxChecks > 0) checks = " c:"+winnersBoxChecks
	winnersBox.setLine(0, '{center}{bold}'+currentLocalTime()+'{/bold}'+winnersBoxStatus+checks+winnersBoxGasPrice+'{/center}')
	screen.render()
}

function setWinnersStatus(status)
{
		winnersBoxStatus = status
		refreshWinnersTitle()
}

function setWinnersChecks(checks)
{
		winnersBoxChecks = checks
		refreshWinnersTitle()
}

function setWinnersGasPrice(gasPrice)
{
		winnersBoxGasPrice = ' @ '+gasPrice
		refreshWinnersTitle()
}

function showWinners(text)
{
	var line = currentLocalTime()+' '+text
	winnersBox.insertLine(1, line);
	screen.render()
}

function setWinnersLineTime(index,when,text)	// Caller is expected to trigger the render
{
	var line = specificLocalTime(when)+' '+text
	winnersBox.setLine(index, line);
}

function setWinnersLine(index,text)
{
	var line = currentLocalTime()+' '+text
	winnersBox.setLine(index, line);
	screen.render()
}

function addWinnersLine(index,text)
{
	var line = currentLocalTime()+' '+text
	winnersBox.insertLine(index, line);
	screen.render()
}


var debugging = false
var lastErrorTag = ""

function showError(text, tag)
{
	if (typeof(text) != 'string')
		text = JSON.stringify(text, undefined, 2)
	var line = currentLocalTime()+' '+text
	if (debugging) console.error(line)
	if (!isUndefined(tag) && tag == lastErrorTag)
	{	
		outputBox.setLine(0, line);
		lastErrorTag = tag
	} else
	{
		outputBox.insertLine(0, line);
		lastErrorTag = !isUndefined(tag)?tag:""
	}
	screen.render()
}

function showLogError(text)
{
	if (!debugging) console.error(currentLocalTime()+' '+text)
	showError(text)
}

function colorValue(value, forcePlus)
{
	if (value < 0)
	{	return '{red-fg}'+shortNum(value)+'{/red-fg}'
	} else if (value > 0)
	{	if (isUndefined(forcePlus))
		{	return '{green-fg}'+shortNum(value)+'{/green-fg}'
		}
		return '{green-fg}+'+shortNum(value)+'{/green-fg}'
	}
	if (isUndefined(forcePlus))
		return '{white-fg}'+shortNum(value)+'{/white-fg}'
	else return '{white-fg}+'+shortNum(value)+'{/white-fg}'
}

function colorSpecificDelta(previousValue, value, forcePlus)
{
	var delta = value - previousValue
	if (delta != 0)
	{
		return ' ('+colorValue(delta, forcePlus)+')'
	}
	return ''
}

var lastValues = {}

function clearDelta(name)
{
	lastValues[name] = void(0)
}

function valueChanged(name, value)
{
	if (isUndefined(lastValues[name])) return true;
	return lastValues[name] != value;
}

function colorDelta(name, value, forcePlus)
{
	if (isUndefined(lastValues[name]))
	{	lastValues[name] = value
		return ''
	}
	
	var delta = value - lastValues[name]
	lastValues[name] = value;
	if (delta != 0)
	{
		return ' ('+colorValue(delta, forcePlus)+')'
	}
	return ''
}








var monitorAddresses = []
monitorAddresses.push(redistributionContract.toLowerCase())
monitorAddresses.push(stakeRegistryContract.toLowerCase())
monitorAddresses.push(gBZZTokenContract.toLowerCase())

const monitorAddresses1 = ["0x62b32288d5292708de7443f78f6714c95e4c75ff","0x830e313ccab2140f72cbfe2dc44bbe0014cd245b","0xc9f8b6297dc6a55846014d326c59c04627380e87","0xa5e44b91b4790fa21765a204024281e75569f224"]
monitorAddresses1.forEach(add => monitorAddresses.push(add.toLowerCase()))



var highlightOverlays = []
myOverlays.forEach(add => highlightOverlays.push(add.toLowerCase()))

function formatOverlay(overlay,n)
{
	var result = leftID(overlay,n)
	if (highlightOverlays.includes(overlay.toLowerCase())) {
		result = '{yellow-fg}'+result+'{/yellow-fg}'
	}
	return result
}


var Winners = []

function refreshWinners()
{
	Winners.sort(function(l,r){
		if (l.overlay == r.overlay) return 0
		if (l.overlay < r.overlay) return -1
		if (l.overlay > r.overlay) return 1
	})
	for (var i=0; i<Winners.length; i++)
	{
		Winners[i].line = i
		setWinnersLineTime(Winners[i].line, Winners[i].when, Winners[i].text)
	}

	screen.render()
}

function formatWinner(i)
{
	winner = Winners[i]
	var result = formatOverlay(winner.overlay,12)+' '+colorValue(winner.amount)+colorDelta(winner.overlay+':amount', winner.amount, true)
	if (winner.frozen) result = result + " {blue-fg}FROZEN{/blue-fg}"
	return result
}

function addWinner(overlay, account, amount)
{
	if (!overlay) return
	
	if (typeof(amount) == 'string') amount = Number(amount)
	
	Winners[Winners.length] = {when: new Date(), overlay: overlay, account: account, amount: amount}
	//setCashBoxChecks(Winners.length)

	Winners[Winners.length-1].text = formatWinner(Winners.length-1)
	addWinnersLine(Winners.length-1, Winners[Winners.length-1].text)
	
	refreshWinners()
}

function updateWinner(overlay, account, amount)
{
	if (typeof(amount) == 'string') amount = Number(amount)

	for (var i=0; i<Winners.length; i++)
	{
		if (Winners[i].overlay == overlay
		&& Winners[i].account == account) {
			Winners[i].when = new Date()
			Winners[i].amount += amount
			Winners[i].frozen = undefined
			Winners[i].text = formatWinner(i)
			refreshWinners()
			return
		}
	}
	addWinner(overlay, account, amount)
}

function freezeWinner(overlay, account, time)
{
	if (typeof(time) == 'string') time = Number(time)

	for (var i=0; i<Winners.length; i++)
	{
		if (Winners[i].overlay == overlay
		&& Winners[i].account == account) {
			Winners[i].when = new Date()
			Winners[i].frozen = true
			Winners[i].text = formatWinner(i)
			refreshWinners()
			return
		}
	}
	addWinner(overlay, account, amount)
}

function getAccountOverlay(account)
{
	for (var i=0; i<Winners.length; i++)
	{
		if (Winners[i].account == account)
			return Winners[i].overlay
	}
	return undefined
}


var Rounds = []

//Rounds[Rounds.length] = { when: new Date(), id: block%blocksPerRound, commits: 0, reveals: 0, slashes: 0, hashes: [ {hash: "0", count: 1}, {hash: "1", count: 1} ], freezes: 1, reward: 0 }

function formatRound(round)
{
	var result = `${round.id}(${round.residual}) ${round.commits}-${round.reveals}`
	if (round.slashes > 0) result = result + `={red-fg}${round.slashes}{/red-fg}`
	var sameDepth = true
	for (var i=0; i<round.hashes.length; i++)
		if (round.hashes[i].depth != round.hashes[0].depth)
			sameDepth = false
	for (var i=0; i<round.hashes.length; i++)
	{
		if (i>0) result = result + '+'
		else result = result + ' '
		var color
		if (round.hashes[i].hash == round.truth)
			color = 'green'
		else color = 'red'
		if (sameDepth) result = result + `{${color}-fg}${round.hashes[i].count}{/${color}-fg}`
		else result = result + `{${color}-fg}${round.hashes[i].count}^${round.hashes[i].depth}{/${color}-fg}`
	}
	if (round.freezes > 0) result = result + `={blue-fg}${round.freezes}{/blue-fg}`
	result = result + ` ${formatOverlay(round.winner,12)}`
	result = result + ` ^${round.depth}`
	result = result + ' {green-fg}' + shortNum(round.reward,true) + '{/green-fg}'
	return result
}

function roundFromBlock(blockNumber)
{
	return Math.floor(blockNumber/blocksPerRound)
}
function roundString(blockNumber)
{
	return `${roundFromBlock(blockNumber)}(${blockNumber%blocksPerRound})`
}

function addRound(blockNumber, commits, reveals, slashes, hashes, freezes, truth, depth, reward, winner)
{
	if (typeof(reward) == 'string') reward = Number(reward)
	const round = { when: new Date(), id: roundFromBlock(blockNumber), residual: blockNumber%blocksPerRound, commits: commits, reveals: reveals, slashes: slashes, hashes: hashes, freezes: freezes, truth: truth, depth: depth, reward: reward, winner: winner }
	//showError(`${formatRound(round)}`)
	
	var line = currentLocalTime()+' '+formatRound(round)
	roundsBox.insertLine(0, line);
	screen.render()
}

var Hashes = []
var HashRound = 0

function clearHashes()
{
	Hashes = []
}

function addHash(blockNumber, hash, depth)
{
	const round = roundFromBlock(blockNumber)
	if (round != HashRound)
		clearHashes()
	HashRound = round
	
	for (var h=0; h<Hashes.length; h++)
	{
		if (Hashes[h].hash == hash && Hashes[h].depth == depth) {
			Hashes[h].count++
			return
		}
	}
	//showError(`${roundString(blockNumber)} new hash ${shortID(hash,16)}`)
	Hashes[Hashes.length] = {hash: hash, depth: depth, count: 1}
}

var Players = []
var PlayersRound = 0

function clearPlayers()
{
	for (var i=0; i<Players.length; i++)
		playersBox.setLine(i,'')
	Players = []
}

async function updatePlayer(p)
{
	const player = Players[p]
	var text = `${roundString(player.blockNumber)} ${formatOverlay(player.overlay,12)} ${player.phase}`
	if (player.depth) text = text + ` ^${player.depth}`
	if (player.hash) text = text + ` ${shortID(player.hash,10)}`
	const line = specificLocalTime(new Date())+' '+text
	playersBox.setLine(p, line);
}

async function addPlayer(blockNumber, overlay, phase, depth, hash)
{
	const round = roundFromBlock(blockNumber)
	if (round != PlayersRound)
		clearPlayers()
	PlayersRound = round
	
	//showError(`${roundString(blockNumber)} Player ${leftID(overlay,16)} ${phase} ${depth} ${shortID(hash,16)}`, overlay)

	const player = {overlay: overlay, blockNumber: blockNumber, phase: phase, depth: depth, hash: hash}
	for (var p=0; p<Players.length; p++)
	{
		if (Players[p].overlay == overlay) {
			Players[p] = player
			updatePlayer(p)
			return true
		}
	}
	Players[Players.length] = player
	updatePlayer(Players.length-1)
	
	return true
}

let Overlays = []
let Accounts = []

async function associateOverlay(overlay, account)
{
	if (isUndefined(Overlays[account])) {
		Overlays[account] = overlay
		Accounts[overlay] = account
		updateWinner(overlay, account, 0.0)
		//showError(`New Account ${account} overlay ${leftID(overlay,18)}`)
	}
}



async function handleCommit(transaction, receipt, input)
{
	if (input.params.length == 2
	&& input.params[0].name == '_obfuscatedHash'
	&& input.params[1].name == '_overlay'
	&& input.params[0].type == 'bytes32'
	&& input.params[1].type == 'bytes32') {
		associateOverlay(input.params[1].value, transaction.from)
		return addPlayer(receipt.blockNumber, input.params[1].value, "commit", undefined, undefined)
	}
	return false
}

async function handleReveal(transaction, receipt, input)
{
	if (input.params.length == 4
	&& input.params[0].name == '_overlay'
	&& input.params[1].name == '_depth'
	&& input.params[2].name == '_hash'
	&& input.params[3].name == '_revealNonce'
	&& input.params[0].type == 'bytes32'
	&& input.params[1].type == 'uint8'
	&& input.params[2].type == 'bytes32'
	&& input.params[3].type == 'bytes32') {
		associateOverlay(input.params[0].value, transaction.from)
		addHash(receipt.blockNumber, input.params[2].value, input.params[1].value)
		return addPlayer(receipt.blockNumber, input.params[0].value, "reveal", input.params[1].value, input.params[2].value)
	}
	return false
}

async function handleClaim(transaction, receipt, input)
{
	if (input.params.length == 0) {
		  if (receipt) {
			const logs = abiDecoder.decodeLogs(receipt.logs)
			if (logs) {
				var truth = undefined
				var depth = undefined
				var value = undefined
				var commits = undefined
				var reveals = undefined
				var freezes = 0
				var slashes = 0
				logs.forEach(log => {
					if (log.name == 'CountCommits') {
						if (log.events.length == 1
						&& log.events[0].name == '_count'
						&& log.events[0].type == 'uint256') {
							const commitCount = log.events[0].value;
							commits = Number(commitCount)
						}
					} else if (log.name == 'CountReveals') {
						if (log.events.length == 1
						&& log.events[0].name == '_count'
						&& log.events[0].type == 'uint256') {
							const revealCount = log.events[0].value;
							reveals = Number(revealCount)
						}
					} else if (log.name == 'TruthSelected') {
						if (log.events.length == 2
						&& log.events[0].name == 'hash'
						&& log.events[1].name == 'depth'
						&& log.events[0].type == 'bytes32'
						&& log.events[1].type == 'uint8') {
							truth = log.events[0].value;
							depth = log.events[1].value
						}
					} else if (log.name == 'StakeFrozen') {
						if (log.events.length == 2
						&& log.events[0].name == 'slashed'
						&& log.events[1].name == 'time'
						&& log.events[0].type == 'bytes32'
						&& log.events[1].type == 'uint256') {
							const overlay = log.events[0].value;
							const time = log.events[1].value
							const account = Accounts[overlay]
							if (!isUndefined(account))
								freezeWinner(overlay, account, time)
							freezes++
						}
					} else if (log.name == 'StakeSlashed') {
						if (log.events.length == 2
						&& log.events[0].name == 'slashed'
						&& log.events[1].name == 'amount'
						&& log.events[0].type == 'bytes32'
						&& log.events[1].type == 'uint256') {
							const overlay = log.events[0].value;
							const amount = log.events[1].value
							const account = Accounts[overlay]
							if (!isUndefined(account)) {
								if (typeof(amount) == 'string') amount = Number(amount)
								updateWinner(overlay, account, -amount)
							}
							slashes++
						}
					} else if (log.name == 'WinnerSelected') {
					} else if (log.name == 'Transfer') {
						if (log.events.length == 3
						&& log.events[0].name == 'from'
						&& log.events[1].name == 'to'
						&& log.events[2].name == 'value'
						&& log.events[0].type == 'address'
						&& log.events[1].type == 'address'
						&& log.events[2].type == 'uint256') {
							value = log.events[2].value
						}
					}
					//showError(log)
					//log.events.forEach(event => {
					//	console.log(event)
					//});
				});
				if (value && reveals && commits && depth && truth) {
					addRound(receipt.blockNumber, commits, reveals, slashes, Hashes, freezes, truth, depth, value, getAccountOverlay(transaction.from))
					clearHashes()
				}

				if (value) {
					updateWinner(getAccountOverlay(transaction.from), transaction.from, value)
				}
				if (truth && depth) {
					return addPlayer(receipt.blockNumber, getAccountOverlay(transaction.from), "{green-fg}claim{/green-fg}", depth, truth)
				}
			}
		  }
	}
	return false
}


async function updateBlockTransactions(blockNumber)
{
  var block = await web3.eth.getBlock(blockNumber)
  if (block.transactions && block.transactions.length > 0) {
    block.transactions.forEach(async tx => {
      var transaction = await web3.eth.getTransaction(tx)
	  var receipt = await web3.eth.getTransactionReceipt(tx)
	  if (!receipt || !receipt.status) {
		  //showError(`Transaction ${tx} FAILED!`)
		  return
	  }
	  
	  var handled = true	// Presume handled to keep it quiet
	  
	  if (transaction.from && monitorAddresses.includes(transaction.from.toLowerCase())) {
		handled = false
	  }

	  if (transaction.to) {
		if (transaction.to.toLowerCase() == redistributionContract.toLowerCase()) {
		  const input = abiDecoder.decodeMethod(transaction.input)
		  if (input.name == 'commit') {
			  handled = await handleCommit(transaction, receipt, input)
		  } else if (input.name == 'reveal') {
			  handled = await handleReveal(transaction, receipt, input)
		  } else if (input.name == 'claim') {
  			  handled = await handleClaim(transaction, receipt, input)
		  }
		} else if (transaction.to.toLowerCase() == stakeRegistryContract.toLowerCase()) {
		  const input = abiDecoder.decodeMethod(transaction.input)
		  handled = false
		} else if (transaction.to.toLowerCase() == gBZZTokenContract.toLowerCase()) {
		  const input = abiDecoder.decodeMethod(transaction.input)
		  handled = false
		} else if (monitorAddresses.includes(transaction.to.toLowerCase())) {
			handled = false
		}
	  }
	  
	  if (!handled) {
        showError('******** RECEIVED TRANSACTION ********');
          showError(transaction)
		  if (receipt) showError(receipt)
		  const input = abiDecoder.decodeMethod(transaction.input)
		  if (input) showError(input)
		  if (receipt) {
			const logs = abiDecoder.decodeLogs(receipt.logs)
			if (logs) {
				logs.forEach(log => {
					showError(log)
					//log.events.forEach(event => {
					//	console.log(event)
					//});
				});
			}
		  }
        showError('*********** END TRANSACTION ***********');
	  }
    });
  }
}

async function updateBlockHeader(blockHeader)
{
	const dt = new Date(blockHeader.timestamp*1000).toISOString()
	const text = `${roundString(blockHeader.number)} Block: ${blockHeader.number} Gas: ${blockHeader.gasUsed}/${blockHeader.gasLimit} Time: ${blockHeader.timestamp} or ${dt}`;
	playersBox.label = "Players - "+text
	showError(text, "block");
	await updateBlockTransactions(blockHeader.number)
}

const Web3 = require('web3');
const abiDecoder = require('abi-decoder');
require('dotenv').config();
var fs = require('fs');
console.log(rpcURL);


//const web3 = new Web3(rpcURL)
//Frame size of 5416344 bytes exceeds maximum accepted frame size

var web3 = new Web3(new Web3.providers.WebsocketProvider(rpcURL,
{
clientConfig:{
maxReceivedFrameSize: 10000000000,
maxReceivedMessageSize: 10000000000,
} 
}));
var BN = web3.utils.BN;	// Big number support for gas pricing



var priceHistory = ''
var priceHistoryCount = 0
var lastPrice = new BN(0)
var oneGwei = new BN('1000000000')

async function updateGasPricing()
{
	const price = new BN(await web3.eth.getGasPrice())
	const cmp = price.cmp(lastPrice)
	const delta = price.sub(lastPrice)
	var percent
	if (!lastPrice.isZero()) {
		const deltaBoost = delta.muln(100)
		percent = deltaBoost.div(lastPrice)
	} else percent = new BN(0)
	const p10 = lastPrice.divn(10)
	//delta.iabs()
	const bigChange = delta.abs() > p10
	
	if (!lastPrice.isZero()) {
		if (bigChange && priceHistory.length > 0) {
			if (cmp < 0) priceHistory = priceHistory + '{green-fg}v{/green-fg}'
			if (cmp == 0) priceHistory = priceHistory + '{yellow-fg}-{/yellow-fg}'
			if (cmp > 0) priceHistory = priceHistory + '{red-fg}^{/red-fg}'
		} else {
			if (cmp < 0) priceHistory = priceHistory + 'v'
			if (cmp == 0) priceHistory = priceHistory + '-'
			if (cmp > 0) priceHistory = priceHistory + '^'
		}
		priceHistoryCount++
		if (priceHistoryCount > 36) {
			if (priceHistory[0] == '{') {
				for (var i=0; i<2; i++) {
					const curly = priceHistory.indexOf('}')
					priceHistory = priceHistory.slice(curly+1)
				}
			} else priceHistory = priceHistory.slice(1)
			priceHistoryCount--
		}
	}
	lastPrice = price
	//if (priceHistory.length > 36) priceHistory = priceHistory.slice(1)

	var units = 'gwei'
	if (price.cmp(oneGwei) < 0)	// Less than 1 gwei, switch to mwei
		units = 'mwei'
	const gwei = web3.utils.fromWei(price, units)
	var text = `{center}Gas Price: ${gwei}${units} ${percent}%{/center}`
	winnersBox.setLine(Winners.length+4 , `{center}${priceHistory}{/center}`);
	winnersBox.insertLine(Winners.length+5 , text);
	screen.render()
}




async function subscribeAll()
{
abiDecoder.addABI(RedistributionABI)
abiDecoder.addABI(StakeRegistryABI)
abiDecoder.addABI(gBZZTokenABI)

	var currentBlockNumber = await web3.eth.getBlockNumber()
	var startingBlockNumber = Math.floor(currentBlockNumber/blocksPerRound)*blocksPerRound;
	startingBlockNumber -= blocksPerRound * preloadRounds
	
	do
	{
		currentBlockNumber = await web3.eth.getBlockNumber()
		showError(`Replaying blocks ${startingBlockNumber} to ${currentBlockNumber}`)
		for (var n = startingBlockNumber; n <= currentBlockNumber; n++)
		{
			var block = await web3.eth.getBlock(n)
			await updateBlockHeader(block)
		}
		startingBlockNumber = currentBlockNumber + 1
	} while (currentBlockNumber != await web3.eth.getBlockNumber())

	let lastBlockNumber = currentBlockNumber

if (false) {
const options = {address: redistributionContract};	// Redistribution Contract
web3.eth.subscribe('logs', options, function(error, result){ 
  if (error) console.error(error);
}).on("data", function(log){
  const decodedLogs = abiDecoder.decodeLogs([log]);
  showError('******** Redistribution RECEIVED EVENT ********');
  //console.log(decodedLogs)
  decodedLogs.forEach(log => {
	showError(log)
	//log.events.forEach(event => {
	//	console.log(event)
    //});
  });
  showError('*********** END Redistribution EVENT ***********');
});
}



if (true) {
const options2 = {address: stakeRegistryContract};	// StakeRegistry contract
web3.eth.subscribe('logs', options2, function(error, result){ 
  if (error) console.error(error);
}).on("data", function(log){
  const decodedLogs = abiDecoder.decodeLogs([log]);
  showError('******** StakeRegistry RECEIVED EVENT ********');
  //console.log(decodedLogs)
  decodedLogs.forEach(log => {
	showError(log)
	//log.events.forEach(event => {
	//	console.log(event)
    //});
  });
  showError('*********** END StakeRegistry EVENT ***********');
});
}



if (true) {
const options3 = {address: gBZZTokenContract};	// gBZZ token contract
web3.eth.subscribe('logs', options3, function(error, result){ 
  if (error) console.error(error);
}).on("data", function(log){
  const decodedLogs = abiDecoder.decodeLogs([log]);
  if (decodedLogs
  && decodedLogs.length == 1
  && decodedLogs[0].name == "Transfer"
  && decodedLogs[0].events.length == 3
  && decodedLogs[0].events[0].name == "from"
  && decodedLogs[0].events[1].name == "to"
  && decodedLogs[0].events[2].name == "value"
  && decodedLogs[0].events[0].type == "address"
  && decodedLogs[0].events[1].type == "address"
  && decodedLogs[0].events[2].type == "uint256") {
		var bzz = decodedLogs[0].events[2].value
		while (bzz.length <= 16) {
			bzz = '0' + bzz
		}
		bzz = bzz.slice(0,bzz.length-16)+"."+bzz.slice(bzz.length-16)
		while (bzz.slice(-1) == '0') {
			bzz = bzz.slice(0,-1)
		}
        if (bzz.slice(-1) == '.') bzz = bzz + '0'
		showError(`${bzz} gBZZ from ${decodedLogs[0].events[0].value} to ${decodedLogs[0].events[1].value}`)
  } else {
  showError('******** gBZZ Token RECEIVED EVENT ********');
  //console.log(decodedLogs)
  decodedLogs.forEach(log => {
	showError(log)
	//log.events.forEach(event => {
	//	console.log(event)
    //});
  });
  showError('*********** END gBZZ Token EVENT ***********');
  }
});
}

let blockSubscription = web3.eth.subscribe('newBlockHeaders')
blockSubscription.subscribe((error, result) => {
	if (error) {
		console.error("Error subscribing to event", error)
		process.exit()
	}
}).on('data', async blockHeader => {
	if (!blockHeader || !blockHeader.number) return
	if (blockHeader.number == lastBlockNumber) return
	lastBlockNumber = blockHeader.number
	updateBlockHeader(blockHeader)
	updateGasPricing()
})

}

function chainName(id)
{
	switch (id) {
	// from https://besu.hyperledger.org/en/stable/public-networks/concepts/network-and-chain-id/
	case 1: return 'mainnet'; break;
	case 5: return 'goerli'; break;
	case 11155111: return 'sepolia'; break;
	case 2018: return 'dev'; break;
	case 61: return 'classic'; break;
	case 63: return 'ordor'; break;
	case 6: return 'kotti'; break;
	case 212: return 'astor'; break;
	// from https://metamask.zendesk.com/hc/en-us/articles/360052711572-How-to-connect-to-the-Gnosis-Chain-network-formerly-xDai-
	case 100: return 'gnosis'; break;
	default:
		return `chain ${id}`
	}
}

addBoxes()

async function showNetwork()
{
	const chainID = await web3.eth.getChainId()
	const nodeInfo = await web3.eth.getNodeInfo()
	const nodeParts = nodeInfo.split('/')
	var provider = nodeParts[0]
	if (nodeParts.length > 1) provider = `${nodeParts[0]} ${nodeParts[1]}`
	winnersBox.insertLine(1,`{center}${chainName(chainID)}{/center}\n{center}${provider}{/center}`)
	screen.render()
}
showNetwork()

screen.render()

subscribeAll()

async function test() {
//const monitorAddresses = JSON.parse(process.env.MONITOR_ADDRESSES);
  var block = await web3.eth.getBlock(7799277)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799316)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799353)
  await updateBlockHeader(block)

  var block = await web3.eth.getBlock(7799425)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799428)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799429)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799465)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799468)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799495)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799505)
  await updateBlockHeader(block)
  
  var block = await web3.eth.getBlock(7799581)
  await updateBlockHeader(block)

  var block = await web3.eth.getBlock(7799660)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799730)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799731)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799771)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799772)
  await updateBlockHeader(block)
  var block = await web3.eth.getBlock(7799810)
  await updateBlockHeader(block)

}
//test()
