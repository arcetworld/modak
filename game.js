const config = {
  type: Phaser.AUTO,
  
  width: 400,
  height: 400,
  parent: "game",
  
  backgroundColor: "#2D604B",
  
  render: {
      pixelArt: true,
    },
  
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },      
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let scene;

// Game state
let gameState = "start";

// Assets
let arcetLogo;
let ganeshaImg;
let music;

// Starting
let startText;
let startBtn;
let htpBtn;

// Modak
let modakCount = 0;
let popupModaks;
let modakText;
let modak;
let modakTween;
let modakTimer;
let modakLifetime = 5000;
let bestOffering = Number(  localStorage.getItem("bestOffering") || 0
);
let bestText;

// Player
let mushika;
let speed = 3;

// Cat
let cat;
let catSpeed = 1;
let catRadar = 100;
let catRoamAngle = 0;

// Hearts
let hearts = 3;
let heartsText;

// Protection
let catProtection = Number(  localStorage.getItem("catProtection") || 0
);
let protectionIcon;
let protectionText;

// Controls
let cursors;
let dpad;
let movement = {
  up: false,
  left: false,
  down: false,
  right: false,
};

// Game Over
let gameOverText;
let restartBtn;

// Offering
let returnBtn;
let cancelBtn;
let offerConfirmBtn;
let offeringText = [];
let playAgainBtn;

// Share
let shareBtn;
let shareConfirmBtn;
let playerNameInput;
let playerName = localStorage.getItem("playerName");

// Preload
function preload() {
  this.load.image("ganesha", "assets/ganesha.png");
  this.load.image("arcet", "https://arcetworld.github.io/assets/images/arcet.webp");

  this.load.audio("music", "assets/music.mp3");
  this.load.audio("collect", "assets/collect.mp3");
  this.load.audio("meow", "assets/meow.mp3");
  this.load.audio("hurt", "assets/hurt.mp3");
}

// Create
function create() {
  scene = this;
  
  // Ganesha image
  ganeshaImg = this.add.image(200, 110, "ganesha");
  ganeshaImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  ganeshaImg.setDisplaySize(280, 280);

  // Arcet logo
  arcetLogo = this.textures.get("arcet").getSourceImage();

  // Start text
  startText = this.add.text(200, 270, "COLLECT AS MANY MODAKS AS YOU CAN AND OFFER THEM TO GANESHA!", {
    fontFamily: '"Press Start 2P"',
    fontSize: "16px",
    color: "#F0E2BD",
    align: "center",
    lineSpacing: 8,
    wordWrap: {
      width: 360,
    },
  }).setOrigin(0.5);
  
  // Start button
  startBtn = document.querySelector(".start");
  startBtn.addEventListener("click", () => {
    startGame();
    fullScreen();
  }); 

  // How to play button
  htpBtn = document.querySelector(".how-to-play");
  
  // Modak count text
  modakText = this.add.text(20, 10, "MODAKS:0", {
    fontFamily: '"Press Start 2P"',
    fontSize: "16px",
    color: "#F0E2BD",
  });

    // Best offering text
  bestText = this.add.text(
    20, 30,
                           "BEST:" + bestOffering,
    {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      color: "#F0E2BD",
    }
  );

  // Hearts text
  heartsText = this.add.text(324, 2, "♥♥♥", {
    fontFamily: '"Press Start 2P"',
    fontSize: "24px",
    color: "#A83F32",
  });

  // Protection text
  protectionIcon = this.add.text(320, 28, "", {
    fontFamily: '"Press Start 2P"',
    fontSize: "24px",
    color: "#C49A45",
  });

  protectionText = this.add.text(348, 36, "", {
    fontFamily: '"Press Start 2P"',
    fontSize: "16px",
    color: "#F0E2BD",
  })

  // Game Over text
  gameOverText = this.add.text(200, 200, "GAME OVER", {
    fontFamily: '"Press Start 2P"',
    fontSize: "32px",
    color: "#F0E2BD",
  }).setOrigin(0.5);
  
  // Offering text
  offeringText = [
  this.add.text(200, 240, "", {
    fontFamily: '"Press Start 2P"',
    fontSize: "16px",
    color: "#F0E2BD",
  }).setOrigin(0.5),

  this.add.text(200, 274, "", {
    fontFamily: '"Press Start 2P"',
    fontSize: "16px",
    color: "#F0E2BD",
    align: "center",
    lineSpacing: 4,
    wordWrap: {
      width: 360,
    },
  }).setOrigin(0.5),

  this.add.text(200, 308, "", {
    fontFamily: '"Press Start 2P"',
    fontSize: "16px",
    color: "#F0E2BD",
  }).setOrigin(0.5)
];
  
  
  // Modak
  modak = this.add.triangle(
    // Position
    Phaser.Math.Between(30, 370),
    Phaser.Math.Between(30, 370), 
    0, 24, // Bottom left
    24, 24, // Bottom right
    12, 0, // Top
    0xC98B3C, // Color    
  );
  this.physics.add.existing(modak);
        
  // Mushika(mouse)
  mushika = this.add.rectangle(
    200, 320, // Position
    16, 32, // Dimensions
    0x634836, // Color
  );
  this.physics.add.existing(mushika);

  // Cat
  cat = this.add.rectangle(
  100, 100, // Position
  40, 20, // Dimensions
  0x4A3E36, // Color
);
  this.physics.add.existing(cat);
  
  // Collisions
  
  // If Mushika touches Modak, then call collectModak()
  this.physics.add.overlap(
    mushika,
    modak,
    collectModak,
    null,
    this
  );

  // If Cat catches Mushika then call catCaught()
  this.physics.add.overlap(
    cat,
    mushika,
    catCaught,
    null,
    this
  );

  // Keyboard Controls
  cursors = this.input.keyboard.createCursorKeys();

  // Touch Screen Controls
  setupTouchControls();

  // D-Pad
  dpad = document.querySelector(".dpad");
  dpad.style.display = "none";
  
  // Restart button
  restartBtn = document.querySelector(".restart");
  restartBtn.addEventListener("click", () => {
    startGame();
    fullScreen();
  });

  // Return button
  returnBtn = document.querySelector(".return");
  returnBtn.addEventListener("click", () => {
    gameState = "paused";

    if (scene.sound.get("meow")?.isPlaying) {
      scene.sound.get("meow").stop();
}
    
    if (modakTimer) {
    modakTimer.paused = true;
    }
    
    if (modakTween) {
      modakTween.pause();
    }
    
    popupModaks.textContent = modakCount;
    returnBtn.style.display = "none";
    dpad.style.display = "none";   
  });

  // Display modak count on popup
  popupModaks = document.querySelector("#popup-modaks");

  // Cancel button
  cancelBtn = document.querySelector(
    "#return-popup [popovertargetaction='hide']"
  );
  cancelBtn.addEventListener("click", () => {
    fullScreen();
    gameState = "playing";
    
    if (modakTimer) {
      modakTimer.paused = false;
    }

    if (modakTween) {
      modakTween.resume();
    }
    
    returnBtn.style.display = "block";
    dpad.style.display = "grid";
  });

  // Offer confirm button
  offerConfirmBtn = document.querySelector(".offer-confirm");
  offerConfirmBtn.addEventListener("click", () => {
    fullScreen();
    showOfferingScreen();
  });

  // Play again button
  playAgainBtn = document.querySelector(".play-again");
  playAgainBtn.addEventListener("click", () => {
    fullScreen();
    startGame();
  });

  // Share button
  shareBtn = document.querySelector(".share");

  shareBtn.addEventListener("click", () => {
    playerName = localStorage.getItem("playerName");
    
    if (playerName) {
      shareBtn.removeAttribute("popovertarget");
      shareGame(playerName);
    } else {
      shareBtn.setAttribute("popovertarget", "playername-popup");
    }   
  });

  playerNameInput = document.querySelector('input[name="playername"]');

  shareConfirmBtn = document.querySelector(".share-confirm");

  shareConfirmBtn.addEventListener("click", () => {
    playerName = playerNameInput.value.trim();

    if (!playerName) return;

    localStorage.setItem("playerName", playerName);

    document.querySelector("#playername-popup").removeAttribute("open", "");
    
    shareGame(playerName);    
  });


  scene.sound.add("meow", {
    loop: true,
    volume: 0.7,
  });
  
  showStartScreen();
}

// Update
function update() {
  if (gameState !== "playing") {
    return;
  }  

  // Mushika movements
  let dx = 0;
  let dy = 0;
  
  if (movement.up || cursors.up.isDown) {
    dy -= 1;
  }

  if (movement.down || cursors.down.isDown) {
    dy += 1;
  }

  if (movement.left || cursors.left.isDown) {
    dx -= 1;
  }
  
  if (movement.right || cursors.right.isDown) {
    dx += 1;
  }

  mushika.x += dx * speed;
  mushika.y += dy * speed;

  if (dx != 0 || dy != 0) {
    mushika.rotation = Math.atan2(dy, dx) - Math.PI / 2;
  }

  // Mushika boundaries
  mushika.x = Phaser.Math.Clamp(mushika.x, 16, 384);
  mushika.y = Phaser.Math.Clamp(mushika.y, 16, 384);

  // Mushika speed
  if (modakCount <= 5) {
  speed = 3;
  } else if (modakCount <= 10) {
  speed = 2.5;
  } else if (modakCount <= 15) {
  speed = 2;
  } else if (modakCount <= 20) {
  speed = 1.5;
  } else {
  speed = 1;
  }

  // Distance between Cat and Mushika
  const distance = Phaser.Math.Distance.Between(
    cat.x,
    cat.y,
    mushika.x,
    mushika.y,
  );

  // Cat behaviour
  if(distance < catRadar) {
    const angle = Phaser.Math.Angle.Between(
      cat.x,
      cat.y,
      mushika.x,
      mushika.y
    );
    
    // Chase Mushika
    cat.x += Math.cos(angle) * catSpeed;
    cat.y += Math.sin(angle) * catSpeed;
    cat.rotation = angle;
    catRoamAngle = angle;

    if (!scene.sound.get("meow")?.isPlaying) {
      scene.sound.get("meow").play();
    } 
    
  }  else {
    if (scene.sound.get("meow")?.isPlaying) {
      scene.sound.get("meow").stop();
    }
    
    // Roam
    cat.x += Math.cos(catRoamAngle) * catSpeed;
    cat.y += Math.sin(catRoamAngle) * catSpeed;
    cat.rotation = catRoamAngle;
    
    
    if(cat.x <= 22 || cat.x >= 378) {
      catRoamAngle = Math.PI - catRoamAngle;
    }

    if (cat.y <= 11 || cat.y >= 389) {
      catRoamAngle = -catRoamAngle;
    }
  }

  // Display Return button
  if ( modakCount > 0) {
    returnBtn.style.display = "block";
  } else {
    returnBtn.style.display = "none";
  }
}

// Show start screen
function showStartScreen() {
  gameState = "start";

  // Show
  ganeshaImg.setVisible(true);
  startText.setVisible(true);
  startBtn.style.display = "block";
  htpBtn.style.display = "block";

  // Hide
  modakText.setVisible(false);
  heartsText.setVisible(false);
  bestText.setVisible(false);
  protectionIcon.setVisible(false);
  protectionText.setVisible(false);
  
  mushika.setVisible(false);
  modak.setVisible(false);
  cat.setVisible(false);

  gameOverText.setVisible(false);
  offeringText.forEach(text => text.setVisible(false));

  dpad.style.display = "none"; 
  restartBtn.style.display = "none";
  returnBtn.style.display = "none";
  playAgainBtn.style.display = "none";
  shareBtn.style.display = "none";
}

// Start game
function startGame() {
  gameState = "playing";

  modakCount = 0;
  hearts = 3;
  
  speed = 3;
  
  catSpeed = 1;
  catRoamAngle = 0;

  bestText.setPosition(20, 30);
  bestText.setOrigin(0);

  // Reset HUD
  modakText.setText("MODAKS:0");
  heartsText.setText("♥♥♥");
  protectionIcon.setText(
    catProtection > 0
    ? "⛨"
    : ""
  );
  protectionText.setText(
    catProtection > 0
    ? "×" + catProtection
    : ""
  );

  // Play music
  if (!music) {
    music = scene.sound.add("music", {
      loop: true,
      volume: 0.3
    });
  }
  
  if (!music.isPlaying) {
    music.play();
  }

  // Show
  modakText.setVisible(true);
  heartsText.setVisible(true);
  bestText.setVisible(true);
  protectionIcon.setVisible(true);
  protectionText.setVisible(true);
  
  mushika.setVisible(true);
  modak.setVisible(true);
  cat.setVisible(true);
  dpad.style.display = "grid";

  // Hide
  ganeshaImg.setVisible(false);
  startText.setVisible(false);
  startBtn.style.display = "none";
  htpBtn.style.display = "none";
  shareBtn.style.display = "none";
  gameOverText.setVisible(false);
  restartBtn.style.display = "none";
  offeringText.forEach(text => text.setVisible(false));
  playAgainBtn.style.display = "none";

  // Reset Mushika position
  mushika.x = 200;
  mushika.y = 320; 

  // Reset Cat position
  cat.x = 100;
  cat.y = 100;

  // Clear ModakTimer
  if (modakTimer) {
    modakTimer.remove(false);
    modakTimer = null;
  }

  // Clear modakTween
  if (modakTween) {
    modakTween.remove();
    modakTween = null;
  }

  

  if (modak && modak.active) {
    modak.destroy();
  }

  spawnModak(scene);
}

// Show offering screen
function showOfferingScreen() {
  if (modakCount <= 0) {
    return;
  }

  if (modakTimer) {
    modakTimer.remove(false);
    modakTimer = null;
  }

  if (modakTween) {
    modakTween.remove();
    modakTween = null;
  }

  if (modak && modak.active) {
    modak.destroy();
  }

  gameState = "offering";

  let newBest = false;
  
  if (modakCount > bestOffering) {
    bestOffering = modakCount;
    
    localStorage.setItem(
      "bestOffering",
      bestOffering
    );

    bestText.setText("BEST:" + bestOffering);

    newBest = true;
    
    catProtection++;
    
    localStorage.setItem("catProtection", catProtection);

    protectionIcon.setText(
      catProtection > 0
      ? "⛨"
      : ""
    );
    protectionText.setText(
      catProtection > 0
      ? "×" + catProtection
      : ""
    );
  } else {
    newBest = false;
  }

  if (newBest) {
    offeringText[0].setText(
      "NEW BEST!");
    offeringText[1].setText(
      "OFFERING " +
      modakCount +
      " MODAKS TO GANESHA!"
    );
    offeringText[2].setText("CAT PROTECTION +1");
    bestText.setVisible(false);
}
  else {
    offeringText[1].setText(
      "OFFERING " +
      modakCount +
      " MODAKS TO GANESHA!"
    );
    bestText.setVisible(true);
  
  bestText.setPosition(200, 308);
bestText.setOrigin(0.5);
  }

    // Show
  ganeshaImg.setVisible(true);
  
  if (newBest) {
    offeringText.forEach(
      text => text.setVisible(true)); 
  } else {
    offeringText[0].setVisible(false);
    offeringText[1].setVisible(true);
    offeringText[2].setVisible(false);
  }
  
  playAgainBtn.style.display = "block";
  shareBtn.style.display = "block";

  //Hide
  modakText.setVisible(false);
  heartsText.setVisible(false);
  protectionIcon.setVisible(false);
  protectionText.setVisible(false);
  
  mushika.setVisible(false);
  modak.setVisible(false);
  cat.setVisible(false);

  dpad.style.display = "none";
  returnBtn.style.display = "none";
}

// Show game over screen
function showGameOverScreen() {
  gameState = "gameOver";

  // Show
gameOverText.setVisible(true);
  restartBtn.style.display = "block";
  shareBtn.style.display = "block";

  // Hide
  modakText.setVisible(false);
  heartsText.setVisible(false);
  bestText.setVisible(false);
  protectionIcon.setVisible(false);
  protectionText.setVisible(false);
  
  mushika.setVisible(false);
  modak.setVisible(false);
  cat.setVisible(false);

  dpad.style.display = "none";
  returnBtn.style.display = "none";    
}

// Touch screen controls
function setupTouchControls() {
  const buttons = {
    up: document.querySelector(".up"),
    down: document.querySelector(".down"),
    left: document.querySelector(".left"),
    right: document.querySelector(".right"),   
  };

  for (const direction in buttons) {
    const button = buttons[direction];

    button.addEventListener("pointerdown", () => {
      movement[direction] = true;
    });
    button.addEventListener("pointerup", () => {
      movement[direction] = false;
    });
    button.addEventListener("pointercancel", () => {
      movement[direction] = false;
    });

    button.addEventListener("pointerleave", () => {
      movement[direction] = false;
    });
  }
}

// Increment, display modak count and destroy modak
function collectModak() {
  if(gameState !== "playing") {
      return;
  }
  
  if (modakTimer) {  
    modakTimer.remove(false);
    modakTimer = null;
  }

  if (modakTween) {
    modakTween.remove();
    modakTween = null;
  }
  
  if (modak && modak.active) {
    modak.destroy();
  }
  
  modakCount++;
  modakText.setText("MODAKS:" + modakCount);
  scene.sound.play("collect");
  spawnModak(this);
}

// Spawn Modak at random position
function spawnModak(scene) {
  modak = scene.add.triangle(
    // Position
    Phaser.Math.Between(30, 370),
    Phaser.Math.Between(30, 370), 
    0, 24, // Bottom left
    24, 24, // Bottom right
    12, 0, // Top
    0xC98B3C, // Color  
  );
  scene.physics.add.existing(modak);

  // If Mushika touches Modak, then call collectModak()
  scene.physics.add.overlap(
    mushika,
    modak,
    collectModak,
    null,
    scene
  );

  modakTimer = scene.time.delayedCall(modakLifetime, () => {
    if (modak && modak.active) {
      modak.destroy();
  }
    modakTimer = null;

    if(gameState === "playing") {
      spawnModak(scene);
    }    
});

  modakTween = scene.tweens.add({
  targets: modak,
  alpha: 0.35,
  duration: 150,
  yoyo: true,
  repeat: 10,
  delay: 3000
});
}

// Cat caught Mushika
function catCaught() {
  if (gameState !== "playing") {
    return;
  }
  scene.sound.get("meow").stop();
  scene.sound.play("hurt");
  
  if (catProtection > 0) {
    catProtection--;
    
    localStorage.setItem("catProtection", catProtection);
    
    protectionIcon.setText(
      catProtection > 0
      ? "⛨"
      : ""
    );
    protectionText.setText(
      catProtection > 0
      ? "×" + catProtection
      : ""
    );
  } else {
    modakCount = 0;
    modakText.setText("MODAKS:" + modakCount);

    hearts--;
    catSpeed += 0.5;
  
    if (hearts <= 0) {
      hearts = 0;
      showGameOverScreen();
      return;
    }
  
    heartsText.setText("♥".repeat(hearts));
  }
  
  // Re-spwan Mushika
  do {
    mushika.x = Phaser.Math.Between(40, 360);
  mushika.y = Phaser.Math.Between(40, 360);
  } while (
    Phaser.Math.Distance.Between(
      cat.x,
      cat.y,
      mushika.x,
      mushika.y
    ) < catRadar
  );
}

// Share game
async function shareGame(playerName) {
  const canvas = document.createElement("canvas");

  canvas.width = 800;
  canvas.height = 800;

  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#2D604B";
  ctx.fillRect(0, 0, 800, 800);

  // MODAK
  ctx.fillStyle = "#C49A45";
  ctx.font = '48px "Press Start 2P"';
  ctx.textAlign = "center";
  ctx.fillText("MODAK", 400, 80);

  // Ganesha image
  const ganeshaShareImg = ganeshaImg.texture.getSourceImage();

ctx.drawImage(ganeshaShareImg, 125, 60, 550, 550);

  // Best score
  ctx.fillStyle = "#F0E2BD";
  ctx.font = '24px "Press Start 2P"';
  ctx.fillText("BEST SCORE", 400, 620);

  ctx.font = '48px "Press Start 2P"';
  ctx.fillText(bestOffering, 400, 675);

  // Player name
  ctx.textAlign = "left";
  ctx.font = '24px "Press Start 2P"';
  ctx.fillText(`@${playerName}`, 40, 760);

  // Arcet logo
  ctx.textAlign = "right";
  ctx.drawImage(arcetLogo, 700, 715, 60, 60);

  const blob = await new Promise(resolve => {
  canvas.toBlob(resolve, "image/png");
});

const file = new File(
  [blob],
  "modak.png",
  { type: "image/png" }
);

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: "MODAK",
      text: `My best score in MODAK is ${bestOffering}.\nCan you beat it?\n`,
  url: "https://arcetworld.github.io/games/modak/",
      files: [file]
    });
} else {
  alert("Sharing is NOT supported");
  }
}

function fullScreen() {
  document.documentElement.requestFullscreen({
      navigationUI: "hide"
    });
}