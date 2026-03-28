let provider;
let signer;
let currentAccount;
let currentChainId;
let tokenDecimals = null;

const logEl = document.getElementById('log');
const currentAccountEl = document.getElementById('currentAccount');
const networkInfoEl = document.getElementById('networkInfo');
const tokenInfoEl = document.getElementById('tokenInfo');

function log(msg) {
  console.log(msg);
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

function parseAddresses(id) {
  const raw = document.getElementById(id).value;
  const lines = raw.split(/\r?\n/).map(a => a.trim()).filter(a => a.length > 0);
  const valid = [];
  const invalid = [];

  for (const a of lines) {
    if (ethers.utils.isAddress(a)) valid.push(a);
    else invalid.push(a);
  }

  if (invalid.length > 0) {
    log("VAROVÁNÍ: Neplatné adresy ignorovány:\n" + invalid.join("\n"));
  }

  return valid;
}

function getTokenAddress() {
  return document.getElementById("tokenAddress").value.trim();
}

function getSweeperAddress() {
  return document.getElementById("sweeperAddress").value.trim();
}

async function connectWallet() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  currentAccount = await signer.getAddress();
  const network = await provider.getNetwork();
  currentChainId = network.chainId;

  currentAccountEl.textContent = "Připojeno: " + currentAccount;
  networkInfoEl.textContent = "Síť: " + network.name + " (chainId " + currentChainId + ")";
  log("Připojeno: " + currentAccount);
}

async function loadTokenInfo() {
  const tokenAddr = getTokenAddress();
  const erc20Abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];
  const token = new ethers.Contract(tokenAddr, erc20Abi, provider);

  try {
    const [name, symbol, decimals] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals()
    ]);
    tokenDecimals = decimals;
    tokenInfoEl.textContent = `Token: ${name} (${symbol}), decimals: ${decimals}`;
    log(`Token načten: ${name} (${symbol}), decimals=${decimals}`);
  } catch (e) {
    tokenInfoEl.textContent = "Nepodařilo se načíst token info.";
    log("Chyba: " + e.message);
  }
}

async function approveToken() {
  const tokenAddr = getTokenAddress();
  const sweeperAddr = getSweeperAddress();

  const erc20Abi = [
    "function approve(address spender, uint256 amount) external returns (bool)"
  ];
  const token = new ethers.Contract(tokenAddr, erc20Abi, signer);

  log("Odesílám approve...");
  const tx = await token.approve(sweeperAddr, ethers.constants.MaxUint256);
  log("TX: " + tx.hash);
  await tx.wait();
  log("Approve potvrzen.");
}

async function revokeApprove() {
  const tokenAddr = getTokenAddress();
  const sweeperAddr = getSweeperAddress();

  const erc20Abi = [
    "function approve(address spender, uint256 amount) external returns (bool)"
  ];
  const token = new ethers.Contract(tokenAddr, erc20Abi, signer);

  log("Odesílám revoke...");
  const tx = await token.approve(sweeperAddr, 0);
  log("TX: " + tx.hash);
  await tx.wait();
  log("Revoke potvrzen.");
}

async function sweep() {
  const sweeperAddr = getSweeperAddress();
  const tokenAddr = getTokenAddress();
  const targetAddr = document.getElementById("targetAddress").value.trim();
  const wallets = parseAddresses("walletsSweep");

  const sweeperAbi = [
    "function sweep(address[] wallets, address token, address target) external"
  ];
  const sweeper = new ethers.Contract(sweeperAddr, sweeperAbi, signer);

  log(`Spouštím sweep pro ${wallets.length} adres...`);
  const tx = await sweeper.sweep(wallets, tokenAddr, targetAddr);
  log("TX: " + tx.hash);
  await tx.wait();
  log("Sweep potvrzen.");
}

async function distribute() {
  const sweeperAddr = getSweeperAddress();
  const tokenAddr = getTokenAddress();
  const wallets = parseAddresses("walletsDistribute");
  const amountHuman = document.getElementById("amountPerWallet").value.trim();

  if (tokenDecimals === null) {
    await loadTokenInfo();
  }

  const amount = ethers.utils.parseUnits(amountHuman, tokenDecimals);

  const sweeperAbi = [
    "function distribute(address source, address token, address[] wallets, uint256 amount) external"
  ];
  const sweeper = new ethers.Contract(sweeperAddr, sweeperAbi, signer);

  log(`Distribuce na ${wallets.length} adres...`);
  const tx = await sweeper.distribute(currentAccount, tokenAddr, wallets, amount);
  log("TX: " + tx.hash);
  await tx.wait();
  log("Distribuce potvrzena.");
}

document.getElementById("connectButton").onclick = connectWallet;
document.getElementById("loadTokenInfoButton").onclick = loadTokenInfo;
document.getElementById("approveButton").onclick = approveToken;
document.getElementById("revokeButton").onclick = revokeApprove;
document.getElementById("sweepButton").onclick = sweep;
document.getElementById("distributeButton").onclick = distribute;
