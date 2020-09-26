pragma solidity >=0.5.0;

interface IKittyCallee {
    function kittyCall(address sender, uint amount0, uint amount1, bytes calldata data) external;
}
