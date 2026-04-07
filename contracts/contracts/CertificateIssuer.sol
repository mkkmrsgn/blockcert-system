// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateIssuer {
    address public owner;

    struct Certificate {
        string certificateNumber;
        string studentName;
        string courseName;
        string schoolName;
        string certificateHash;
        uint256 issueDate;
        bool isValid;
        bool exists;
    }

    mapping(string => Certificate) private certificates;

    event CertificateIssued(
        string certificateNumber,
        string studentName,
        string courseName,
        string schoolName,
        string certificateHash,
        uint256 issueDate
    );

    event CertificateRevoked(
        string certificateNumber,
        uint256 revokedAt
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(
        string memory _certificateNumber,
        string memory _studentName,
        string memory _courseName,
        string memory _schoolName,
        string memory _certificateHash
    ) public onlyOwner {
        require(!certificates[_certificateNumber].exists, "Certificate already exists");

        certificates[_certificateNumber] = Certificate({
            certificateNumber: _certificateNumber,
            studentName: _studentName,
            courseName: _courseName,
            schoolName: _schoolName,
            certificateHash: _certificateHash,
            issueDate: block.timestamp,
            isValid: true,
            exists: true
        });

        emit CertificateIssued(
            _certificateNumber,
            _studentName,
            _courseName,
            _schoolName,
            _certificateHash,
            block.timestamp
        );
    }

    function verifyCertificate(
        string memory _certificateNumber
    )
        public
        view
        returns (
            string memory certificateNumber,
            string memory studentName,
            string memory courseName,
            string memory schoolName,
            string memory certificateHash,
            uint256 issueDate,
            bool isValid,
            bool exists
        )
    {
        Certificate memory cert = certificates[_certificateNumber];
        return (
            cert.certificateNumber,
            cert.studentName,
            cert.courseName,
            cert.schoolName,
            cert.certificateHash,
            cert.issueDate,
            cert.isValid,
            cert.exists
        );
    }

    function revokeCertificate(string memory _certificateNumber) public onlyOwner {
        require(certificates[_certificateNumber].exists, "Certificate does not exist");
        require(certificates[_certificateNumber].isValid, "Certificate already revoked");

        certificates[_certificateNumber].isValid = false;

        emit CertificateRevoked(_certificateNumber, block.timestamp);
    }
}