const puppeteer = require('puppeteer');
const Discord = require('discord.js');

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}
function extractProductNameFromUrl(url){
    const parts = url.split('/produit/');
    if(parts.length === 2){
        return parts[1].split('/')[0];
    }
    return null;
}

async function send_discord_message(message, userId){
    const client = new Discord.Client({ intents: 'DirectMessages'});
    const discordToken = 'YOUR_DISCORD_BOT_TOKEN'

    await client.login(discordToken);

    await new Promise(resolve => {
        client.on('ready', () => {
            console.log(`Connecté en tant que ${client.user.tag}`);
            resolve();
        });
    });

    const user = await client.users.fetch(userId);

    if(!user){
        console.log(`Impossible de trouver l'utilisateur avec l'ID : ${userId}`);
        return;
    }

    try {
        await user.send(message);
        console.log('Message Discord envoyé avec succès en message privé !');
    } catch (error) {
        console.error('Une erreur s\'est produite lors de l\'envoi du message privé Discord :', error);
    }

    client.destroy();
}


async function verif_display(){
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    const pagesToTest = ['https://www.cardshunter.fr/produit/display-one-piece-card-game-romance-dawn-op01-version-anglaise/', 'https://www.cardshunter.fr/produit/carton-de-12-display-one-piece-card-game-romance-dawn-op01/', 'https://www.cardshunter.fr/produit/boite-de-24-boosters-one-piece-card-game-paramount-war-op-02/'];
    const availablePages = [];

    for(const url of pagesToTest){
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await sleep(5000);

    const button = await page.$('button[name="add-to-cart"]');
    if(button){
        console.log(`La display est disponible sur la page ${url}.`);
        const productName = extractProductNameFromUrl(url);
        availablePages.push(productName);
    }else{
        console.log('La display n\'est pas disponible sur la page.');
    }
    }

    console.log('Pages avec les display disponible : ', availablePages);

    if(availablePages.length > 0){
        const message = "Des display dont disponibles : " + availablePages.join(", ");
        const userId = 'USER_DISCORD_ID';
        await send_discord_message(message, userId);
    }else{
        console.log("Aucune display disponible.");
    }
    
    await browser.close();
}

verif_display();

setInterval(verif_display, 5 * 60 * 1000);

