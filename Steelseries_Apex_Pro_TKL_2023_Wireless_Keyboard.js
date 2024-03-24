import OLEDLogos from "./OLEDLogos.test.js";

export function Name() { return "SteelSeries Apex Pro TKL 2023 Wireless"; }
export function VendorId() { return 0x1038; }
export function ProductId() { return [0x1630, 0x1632]; }
export function Publisher() { return "WhirlwindFX"; }
export function Documentation(){ return "troubleshooting/steelseries"; }
export function Size() { return [17, 6]; }
export function DefaultPosition(){return [10, 100];}
const DESIRED_HEIGHT = 85;
export function DefaultScale(){return Math.floor(DESIRED_HEIGHT/Size()[1]);}
/* global
shutdownColor:readonly
LightingMode:readonly
forcedColor:readonly
LCDToggle:readonly
*/
export function ControllableParameters(){
	return [
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"OLEDToggle", "group":"", "label":"OLED on", "type":"boolean", "default":"false"},
		{"property":"OLEDImage", "group":"", "label":"OLED Image", "type":"combobox", "values":["SignalRGB", "Kirby"], "default":"SignalRGB"},
	];
}
const vLedNames = [
	"< ISO", "# ISO", //ISO
	"Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
	"`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-_", "=+", "Backspace",                        "Insert", "Home", "Page Up",
	"Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\",                               "Del", "End", "Page Down",
	"CapsLock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter",
	"Left Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Right Shift",                                  "Up Arrow",
	"Left Ctrl", "Left Win", "Left Alt", "Space", "Right Alt", "Fn", "Menu", "Right Ctrl",  "Left Arrow", "Down Arrow", "Right Arrow"
];

const vLedPositions = [
	[1, 4], [12, 3], //ISO
	[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0],
	[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1],   [14, 1], [15, 1], [16, 1],
	[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2],   [14, 2], [15, 2], [16, 2],
	[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3],         [13, 3],
	[0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4],                 [13, 4],           [15, 4],
	[0, 5], [1, 5], [2, 5],                      [6, 5],                      [10, 5], [11, 5], [12, 5], [13, 5],   [14, 5], [15, 5], [16, 5],
];

const vKeymap = [
	100, 50, //ISO
	41, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
	53, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 45, 46, 42,      73, 74, 75,
	43, 20, 26, 8, 21, 23, 28, 24, 12, 18, 19, 47, 48, 49,       76, 77, 78,
	57, 4, 22, 7, 9, 10, 11, 13, 14, 15, 51, 52, 40,
	225, 29, 27, 6, 25, 5, 17, 16, 54, 55, 56, 229,                 82,
	224, 227, 226, 44, 230, 231, 240, 228,                       80, 81, 79,
];

let oledData = null;
let oledIsAnimation = false;
let oledSent = false;
let currentFrame = 0;
let maxFrames = 0;
let lastRender = 0;
let lastOledImageSetting = null;

export function LedNames() {
	return vLedNames;
}

export function LedPositions() {
	return vLedPositions;
}

export function Initialize() {

	device.send_report([0x00, 0x4b], 642);
}
function checkOLEDImage()
{
	if (OLEDImage !== lastOledImageSetting)
	{
		lastOledImageSetting = OLEDImage;

		device.log(`Switching OLED image to ${OLEDImage}`);
		oledData = OLEDLogos[OLEDImage];
		maxFrames = oledData.length;
		currentFrame = 0;
		oledIsAnimation = (maxFrames > 1);
		oledSent = false;
	}
}

export function Render()
{
	let now = Date.now();
	if(OLEDToggle)
	{
		checkOLEDImage();

		if (oledIsAnimation)
		{
			if (lastRender === 0)
			{
				sendColors();
				lastRender = now;
				return;
			}

			if (now - lastRender >= 100)
			{
				lastRender = now;
				device.send_report([0x00, 0x61, ...oledData[currentFrame], 0x00], 642);
				currentFrame++;
				if (currentFrame == maxFrames)
				{
					currentFrame = 0;
				}
			} else
			{
				sendColors();
			}
		} else if (!oledSent)
		{
			device.send_report([0x00, 0x61, ...oledData[0], 0x00], 642);
			oledSent = true;
		} else
		{
			sendColors();
		}
	} else {
		sendColors();
	}
}

export function Shutdown() {
	sendColors(true);
}

function sendColors(shutdown = false){
	const packet = [];
	const red = [];
	const green = [];
	const blue = [];
	packet[0x00]   = 0x00;
	packet[0x01]   = 0x61;
	packet[0x02]   = vKeymap.length;

	for (var idx = 0; idx < vKeymap.length; idx++) {
		const iPxX = vLedPositions[idx][0];
		const iPxY = vLedPositions[idx][1];
		var color;

		if(shutdown){
			color = hexToRgb(shutdownColor);
		}else if (LightingMode === "Forced") {
			color = hexToRgb(forcedColor);
		}else{
			color = device.color(iPxX, iPxY);
		}

		red[vKeymap[idx]] = color[0];
		green[vKeymap[idx]] = color[1];
		blue[vKeymap[idx]] = color[2];
	}

	for(var idx = 0; idx < vKeymap.length; idx++){
		packet[(idx * 4) + 3] = vKeymap[idx];
		packet[(idx * 4) + 4] = red[vKeymap[idx]];
		packet[(idx * 4) + 5] = green[vKeymap[idx]];
		packet[(idx * 4) + 6] = blue[vKeymap[idx]];
	}

	device.send_report(packet, 642);
}

function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	const colors = [];
	colors[0] = parseInt(result[1], 16);
	colors[1] = parseInt(result[2], 16);
	colors[2] = parseInt(result[3], 16);

	return colors;
}

export function Validate(endpoint) {
	//endpoint = 1 1 ffc0
	//Takes both a size 64 'system' WRITE, and size 643 RGB data REPORT
	return endpoint.interface === 3 && endpoint.usage === 0x0001;
}

export function Image() {
}