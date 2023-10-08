/*
VaultCord.com Discord member restore bot
DO NOT TRY TO HOST THIS YOURSELF! Your site will likely break when we do updates.
Element IDs:
successCheck,
failureCross,
serverIcon,
serverTitle,
serverInstructions,
serverVerifyBtn,
serverUnlinkBtn
*/
window.onload = async (event) => {
	if(!window.location.hostname) {
		document.getElementById("serverTitle").textContent="Invalid domain";
		document.getElementById("serverInstructions").textContent="You must host this online, follow our instructions.";
		return;
	}
	
	let code = new URLSearchParams(location.search).get('code');
	if(code) {
		let ipAddr = null;
		let fingerprint = null;
		
		// Initialize the agent at application startup.
		const fpPromise = import('https://openfpcdn.io/fingerprintjs/v4')
			.then(FingerprintJS => FingerprintJS.load())
		
		// Get the visitor identifier when you need it.
		fpPromise
			.then(fp => fp.get())
			.then(result => {
				// This is the visitor identifier:
				fingerprint = result.visitorId
			})
		
		try {
			let req = await fetch('https://api.ipify.org/?format=json');
			let json = await req.json();
			ipAddr = json.ip;
		}
		catch {}
	
		let response = await fetch('https://api.vaultcord.com/servers/verify', {
		method: 'POST',
		body: JSON.stringify({
			code: code,
			domain: window.location.hostname,
			ip: ipAddr,
			fingerprint: fingerprint,
		}),
		headers: {
			'Content-Type': 'application/json'
		}
		});
		
		let body = await response.json();
		if(body.success) {
			document.getElementById("successCheck").hidden=false;
			document.getElementById("serverTitle").textContent="Verified!";
			document.getElementById("serverInstructions").innerHTML="Successfully verifed!";
		}
		else {
			document.getElementById("failureCross").hidden=false;
			document.getElementById("serverTitle").textContent="Error";
			document.getElementById("serverInstructions").textContent=body.message;
		}
		return;
	}
	
    let response = await fetch(`https://api.vaultcord.com/servers/profile/${window.location.hostname}`, { cache: 'no-store' });
	let body = await response.json();
	
	if(!body.success) {
		document.getElementById("failureCross").hidden=false;
		document.getElementById("serverTitle").textContent="Error";
		document.getElementById("serverInstructions").textContent=body.message;
		return;
	}
	
	document.getElementById("serverTitle").textContent=body.server.name;
	document.getElementById("serverIcon").hidden=false;
	document.getElementById("serverIcon").src=`https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(body.server.pic)}`;
	document.getElementById("serverVerifyBtn").hidden=false;
	document.getElementById("serverVerifyBtn").href=`https://discord.com/oauth2/authorize?client_id=${body.bot.clientId}&redirect_uri=https://${window.location.hostname}/&response_type=code&scope=identify+guilds.join`;
	document.getElementById("serverUnlinkBtn").hidden=false;
};

async function unlinkServer() {
	document.getElementById("serverTitle").textContent="Loading..";
	let response = await fetch(`https://api.vaultcord.com/servers/deauth/${window.location.hostname}`, { cache: 'no-store' });
	let body = await response.json();
	
	if(!body.success) {
		document.getElementById("failureCross").hidden=false;
		document.getElementById("serverTitle").textContent="Error";
		document.getElementById("serverInstructions").textContent=body.message;
		return;
	}
	
	document.getElementById("serverTitle").textContent="How to unlink:";
	document.getElementById("serverInstructions").innerHTML = `The bot's username is <strong>${body.name}</strong><br><br>Follow this tutorial to unlink <a href="https://www.iorad.com/player/2100432/Discord---How-to-deauthorize-an-app" target="_blank">https://www.iorad.com/player/2100432/Discord---How-to-deauthorize-an-app</a>`;
}

// use header x-vc-user instead of Authorization, since firefox isn't going to support * origin for Authorization header soon.
