// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TouristRegistry is Ownable {
    // Event to announce a new registration
    event TouristRegistered(uint256 indexed touristId, bytes32 dataHash, address indexed registeredBy);

    uint256 private _idCounter;
    // Mapping from a data hash to see if it's already registered
    mapping(bytes32 => bool) private _isHashRegistered;
    // Mapping from the new ID to the hash
    mapping(uint256 => bytes32) private _idToHashMap;
    // ✅ ADDED: Mapping from the hash to the new ID for easy lookup
    mapping(bytes32 => uint256) private _hashToIdMap;

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Registers a new tourist by storing a hash of their data.
     * The actual data is kept off-chain.
     * @param dataHash A SHA-256 hash of the tourist's KYC information.
     */
    function registerTourist(bytes32 dataHash) external onlyOwner returns (uint256) {
        require(!_isHashRegistered[dataHash], "Tourist data hash already registered.");

        _idCounter++;
        uint256 newId = _idCounter;

        _isHashRegistered[dataHash] = true;
        _idToHashMap[newId] = dataHash;
        _hashToIdMap[dataHash] = newId; // ✅ ADDED: Store the reverse mapping

        emit TouristRegistered(newId, dataHash, msg.sender);

        return newId;
    }

    /**
     * ✅ ADDED: Getter function to retrieve the Digital ID from a hash.
     */
    function getDigitalId(bytes32 dataHash) external view returns (uint256) {
        require(_isHashRegistered[dataHash], "Tourist hash not found.");
        return _hashToIdMap[dataHash];
    }

    /**
     * @dev Public view function to check if a hash is registered.
     */
    function isRegistered(bytes32 dataHash) external view returns (bool) {
        return _isHashRegistered[dataHash];
    }

    /**
     * @dev Get the total number of registered tourists.
     */
    function totalTourists() external view returns (uint256) {
        return _idCounter;
    }
}