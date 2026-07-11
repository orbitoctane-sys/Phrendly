const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");

let balance = 0;
let spinning = false;
let currentRotation = 0;

const multipliers = [0, 1, 2, 3, 4, 5, 6];

spinBtn.addEventListener("click", spinWheel);

function spinWheel() {

    if (spinning) return;

    const betInput = document.querySelector("input");
    const bet = parseFloat(betInput.value);

    if (!bet || bet < 30) {
        alert("Minimum bet is KES 30");
        return;
    }

    spinning = true;

    const winnerIndex =
        Math.floor(Math.random() * multipliers.length);

    const segmentAngle = 360 / 7;

    const stopAngle =
        winnerIndex * segmentAngle;

    const extraSpins = 360 * 6;

    currentRotation +=
        extraSpins +
        (360 - stopAngle);

    wheel.style.transform =
        `rotate(${currentRotation}deg)`;

    setTimeout(() => {

        const multiplier =
            multipliers[winnerIndex];

        const winnings =
            bet * multiplier;

        balance += winnings;

        document.querySelector(".balance-card h2")
            .textContent =
            `KES ${balance.toFixed(2)}`;

        alert(
            `Result: ${multiplier}x\nYou won KES ${winnings.toFixed(2)}`
        );

        spinning = false;

    }, 5000);
}