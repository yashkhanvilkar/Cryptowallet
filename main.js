console.log("Hello World");

// connect to Moralis server
Moralis.initialize("hIBoObjrnV5fE6yFlXCX1rx201iwXlLjwywCOkv2");
Moralis.serverURL = "https://cxx2mv1jvjt6.grandmoralis.com:2053/server";

let homepage = "https://yashkhanvilkar.github.io/Cryptowallet/index.html";

if (Moralis.User.current() == null && window.location.href != homepage) {
    document.querySelector('body').style.display = 'none';
    window.location.href = "index.html";
}

login = async () => {
    try {
        await Moralis.authenticate().then(async function (user) {
            // console.log("logged in");
            user.set("name", document.getElementById('user-username').value);
            user.set("email", document.getElementById('user-email').value);
            await user.save();
            window.location.href = "dashboard.html";
        })
        
    } catch (error) {
        alert("Invalid User Credentials");
        location.reload(); 
    }
}

logout = async () => {
    await Moralis.User.logOut();
    window.location.href = "index.html";
}

getTransactions = async () => {
    // console.log('get Transactions clicked');
    let currentEthAddress = Moralis.User.current().get('ethAddress');
    const options = { chain: "ropsten", address: currentEthAddress };
    const transactions = await Moralis.Web3API.account.getTransactions(options);
    // console.log(transactions);

    if (transactions.total > 0) {
        let table = `
        <table class="table">
        <thead>
            <tr>
            <th scope="col">Transactions</th>
            <th scope="col">Block Number</th>   
            <th scope="col">Age</th>
            <th scope="col">Type</th>
            <th scope="col">Fee</th>
            <th scope="col">Value</th>
             </tr>
        </thead>
        <tbody id="theTransactions">
        </tbody>
        </table>
        `
        document.querySelector('#tableOfTransactions').innerHTML = table;

        transactions.result.forEach(t => {
            let content =`
            <tr>
                <td><a href="https://ropsten.etherscan.io/tx/${t.hash}" target="_blank" rel="noopener noreferrer">${t.hash}</a></td>
                <td><a href="https://ropsten.etherscan.io/block/${t.block_number}" target="_blank" rel="noopener noreferrer">${t.block_number}</a></td>  
                <td>${millisecondsToTime(Date.parse(new Date()) - Date.parse(t.block_timestamp))}</td>
                <td>${t.from_address == Moralis.User.current().get('ethAddress') ? 'Outgoing' : 'Incoming'}</td>
                <td>${((t.gas * t.gas_price) / 1e18).toFixed(5)} ETH</td>
                <td>${(t.value / 1e18).toFixed(5)} ETH</td>
             </tr>
            `
            theTransactions.innerHTML += content;
        });
    }
}

getBalances = async () => {
    // console.log("Clicked getBalances");
    const ethBalance = await Moralis.Web3API.account.getNativeBalance();
    const ropstenBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "ropsten"});
    const rinkebyBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "rinkeby"});
    // console.log((ethBalance.balance/1e18).toFixed(5) + " ETH");
    // console.log((ropstenBalance.balance/1e18).toFixed(5) + " ETH");
    // console.log((rinkebyBalance.balance/1e18).toFixed(5) + " ETH");

    let content = document.querySelector('#userbalances').innerHTML = `
<table class="table">
    <thead>
        <tr>
            <th scope="col"> Chain </th>
            <th scope="col"> Balance </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>Ether</th>
            <td>${(ethBalance.balance/1e18).toFixed(5)} ETH</td>
        </tr>
        <tr>
            <th>Ropsten</th>
            <td>${(ropstenBalance.balance/1e18).toFixed(5)} ETH</td>
        </tr>
        <tr>
            <th>Rinkeby</th>
            <td>${(rinkebyBalance.balance/1e18).toFixed(5)} ETH</td>
        </tr>
    </tbody>
</table>
    `
}

getNFTs = async () => {
    // console.log("get nfts clicked");
    let nfts = await Moralis.Web3API.account.getNFTs({chain: 'ropsten'});
    console.log(nfts);
    let tableOfNFTs = document.querySelector('#tableOfNFTs');
    if(nfts.result.length > 0){
        nfts.result.forEach(n => {
            let metadata = JSON.parse(n.metadata);
            let content = `
            <div class="card col-md-3">
                <img src="${fixURL(metadata.image_url)}" class="card-img-top" height=300 alt="NFT">
                <div class="card-body">
                    <h5 class="card-title">${metadata.name}</h5>
                    <p class="card-text">${metadata.description}</p>
                </div>
            </div>
            `
            tableOfNFTs.innerHTML += content;
        })
    }
    else{
        let content = `<h5>You do not have any NFTs to display</h5>`;
        tableOfNFTs.innerHTML += content;
    }
}

fixURL = (url) => {
    if (url.startsWith("ipfs")) {
        return "https://ipfs.moralis.io:2053/ipfs" + url.split("ipfs://").slice(-1);
    }
    else{
        return url + "?format=json";
    }
}


//Current time(in ms) - Block Time(in ms)= Time in Mill
//(Date.parse(new Date()) - Date.parse(t.block_timestamp))

millisecondsToTime = (ms) =>{
    let minutes =Math.floor(ms / (1000 * 60));
    let hours =Math.floor(ms / (1000 * 60 * 60));
    let days =Math.floor(ms / (1000 * 60 * 60 * 24));
    if(days < 1){
        if(hours < 1){
            if(minutes < 1){
                return `less than a minute ago`
            }else return `${minutes} minute(s) ago`
        } else return `${hours} hours(s) ago`
    } else return `${days} day(s) ago`
}



function authenticateLogin() {
    let userName = document.getElementById('user-username');
    let userEmail = document.getElementById('user-email');

    if(userName.value == null || userName.value === ''){
        alert("Please Enter Your Username");
    }
    if(userEmail.value == null || userEmail.value === ''){
        alert("Please Enter Your Email");
    }
    else{
        return login();
    }
    
}

if (document.querySelector('#btn-login') != null) {
    document.querySelector('#btn-login').onclick = authenticateLogin;
}

if (document.querySelector('#btn-logout') != null) {
    document.querySelector('#btn-logout').onclick = logout;
}
if (document.querySelector('#get-transactions-link') != null) {
    document.querySelector('#get-transactions-link').onclick = getTransactions;
}
if (document.querySelector('#get-balances-link') != null) {
    document.querySelector('#get-balances-link').onclick = getBalances;
}
if (document.querySelector('#get-nfts-link') != null) {
    document.querySelector('#get-nfts-link').onclick = getNFTs;
}
