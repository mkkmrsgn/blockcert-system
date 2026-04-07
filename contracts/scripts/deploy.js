const hre = require("hardhat");

async function main() {
  const CertificateIssuer = await hre.ethers.getContractFactory("CertificateIssuer");
  const certificateIssuer = await CertificateIssuer.deploy();

  await certificateIssuer.waitForDeployment();

  console.log("CertificateIssuer deployed to:", await certificateIssuer.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});