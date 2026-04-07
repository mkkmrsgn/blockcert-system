const { ethers } = require("ethers");

const abi = [
  "function issueCertificate(string memory _certificateNumber, string memory _studentName, string memory _courseName, string memory _schoolName, string memory _certificateHash) public",
  "function verifyCertificate(string memory _certificateNumber) public view returns (string memory certificateNumber, string memory studentName, string memory courseName, string memory schoolName, string memory certificateHash, uint256 issueDate, bool isValid, bool exists)",
  "function revokeCertificate(string memory _certificateNumber) public"
];

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

let privateKey = (process.env.PRIVATE_KEY || "").trim();
if (privateKey && !privateKey.startsWith("0x")) {
  privateKey = "0x" + privateKey;
}

const wallet = new ethers.Wallet(privateKey, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet
);

async function issueCertificateOnChain(certificateNumber, studentName, courseName, schoolName, certificateHash) {
  const tx = await contract.issueCertificate(
    certificateNumber,
    studentName,
    courseName,
    schoolName,
    certificateHash
  );
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

async function verifyCertificateOnChain(certificateNumber) {
  return await contract.verifyCertificate(certificateNumber);
}

async function revokeCertificateOnChain(certificateNumber) {
  const tx = await contract.revokeCertificate(certificateNumber);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

module.exports = {
  issueCertificateOnChain,
  verifyCertificateOnChain,
  revokeCertificateOnChain,
};