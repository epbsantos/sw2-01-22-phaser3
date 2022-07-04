var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: false
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var map;
var player;
var cursors;
var groundLayer, coinLayer;
var text;
var score = 0;

function preload() {
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map', 'mapas/06.json');
    // tiles in spritesheet 
    this.load.spritesheet('plataformPack', 'assets/plataformerPack/platformPack_tilesheet.png', {frameWidth: 64, frameHeight: 64});
    
    this.load.spritesheet('player', 
        'assets/plataformerPack/player.png',
        { frameWidth: 96, frameHeight: 96 }
    );
}

function create() {
    // load the map 
    map = this.make.tilemap({key: 'map'});

    // tiles for the ground layer
    var tiles = map.addTilesetImage('platformPack_tilesheet' , 'plataformPack');
    // create the ground layer
    groundLayer = map.createDynamicLayer('terreno', tiles, 0, 0);
    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);

    //matoLayer = map.createDynamicLayer('fundo', tiles, 0, 0);
    //matoLayer.depth = -10;

    // add coins as tiles
    //coinLayer = map.createDynamicLayer('diamantes', tiles, 0, 0);
    //coinLayer.setCollisionByExclusion([-1]);

    
    //morteLayer = map.createDynamicLayer('morte', tiles, 0, 0);
    //morteLayer.setCollisionByExclusion([-1]);

    // add fim as tiles
    //fimLayer = map.createDynamicLayer('fim', tiles, 0, 0);

    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // create the player sprite    
    player = this.physics.add.sprite(200, 200, 'player');
    //player.setBounce(0.1); // our player will bounce from items
    player.setCollideWorldBounds(true); // don't go out of the map    
    
    // small fix to our player images, we resize the physics body object slightly
    player.body.setSize(player.width-32, player.height-32); // altura de 64px
    player.body.setOffset(16,32); //arrumar a posição do collider
    
    // player will collide with the level tiles 
    this.physics.add.collider(groundLayer, player);

    //this.physics.add.collider(player, morteLayer, morreu, null, this);
    
    //this.physics.add.collider(player, coinLayer, collectCoin, null, this);
    
    

    // player walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player', { start: 2, end: 3 }),
        frameRate: 10,
        repeat: -1,
        
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: [ { key: 'player', frame: 0 } ],
        frameRate: 10,
    });

    this.anims.create({
        key: 'jump',
        frames: [ { key: 'player', frame: 1 } ],
        frameRate: 10,
    });

    this.anims.create({
        key: 'die',
        frames: [ { key: 'player', frame: 6 } ],
        frameRate: 10,
    });


    cursors = this.input.keyboard.createCursorKeys();

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(player);

    // set background color, so the sky is not black    
    this.cameras.main.setBackgroundColor('#ccccff');

    // this text will show the score
    text = this.add.text(20, 570, '0', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    // fix the text to the camera
    text.setScrollFactor(0);
}

// this function will be called when the player touches a coin
function collectCoin(sprite, tile) {
    coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    score++; // add 10 points to the score
    text.setText(score); // set the text to show the current score
    return false;
}

function morreu()
{
    //this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('die');

    this.scene.pause();

    

    //this.Scenes.restart();
}

function update(time, delta) {
    if (player.body.onFloor() && player.body.velocity.x == 0)
    {
        player.anims.play('idle', true);
    }
    
    // Walk
    if (cursors.left.isDown && player.body.onFloor())
    {
        player.body.setVelocityX(-200);
        player.anims.play('walk', true); // walk left
        player.flipX = true; // flip the sprite to the left
    }
    else if (cursors.right.isDown && player.body.onFloor())
    {
        player.body.setVelocityX(200);
        player.anims.play('walk', true);
        player.flipX = false; // use the original sprite looking to the right
    } else {
        player.body.setVelocityX(0);
    }
    
    // jump 
    if (cursors.up.isDown && player.body.onFloor())
    {
        player.body.setVelocityY(-400);  
        player.anims.play('jump', true);      
    }
    else if (cursors.left.isDown && !player.body.onFloor())
    {
        player.body.setVelocityX(-200);
        player.flipX = true; // flip the sprite to the left
    }
    else if (cursors.right.isDown && !player.body.onFloor())
    {
        player.body.setVelocityX(200);
        player.flipX = false; // use the original sprite looking to the right
    }
}