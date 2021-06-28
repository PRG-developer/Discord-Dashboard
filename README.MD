# Install

```js
npm i discord-dashboard
```
or
```js
npm i discord-web-dashboard
```

# Docs website

Better looking documentation with navigation: https://assistants.ga/dbd-docs/#/

<hr>

# Documentation

Official **Discord Web Dashoard** documentation. The best way to create a Web Dashboard for your Discord Bot! No need to edit files or write the server from scratch!

All available functions are described below.

## Get help

Join our Discord server to get help: https://discord.gg/CHbfcSbEgd

## LICENSE

The project is licensed by [MIT](https://en.wikipedia.org/wiki/MIT_License). This means that you can edit it, but you must mention its author publicly in this project (breftejk, Github: https://github.com/breftejk, Discord Server: https://discord.gg/CHbfcSbEgd).

## Initial steps

### Installing the module

To install all the modules needed for the project to run, you need to run one simple command:

```
npm i discord-dashboard
```

### Setup

For the Dashboard to work, you need to create the server it will be based on. Fortunately, we help you with this and you can do it this way:

```js
const DBD = require('discord-dashboard');

const Dashboard = new DBD.Dashboard(config);
```

That's all. The server is ready to run. Before starting up, however, you must understand the options needed to start the server.

#### What's config

Thanks to the config, server knows how to behave and what settings to use. There are many useful options as described in the [Config](#config) section.

#### Server start

For everything to start working, the server needs to be started. After setting config, all you have to do is do:

```js
Dashboard.init();
```

Where `Dashboard` is your first step in the [Setup](#setup) section.

## Config

It depends on how your Dashboard will work and look. If you want it to have a "Setup" section with a "Language" setting, set it up here. If you want it to have a crocodile icon, do it here. If you want it to run on port 80, do so here. It all depends on config.

### Server Stuff

Config allows you to set server-stuff. All the options available here are:

```js
...
  port: 80,
  domain: 'http://localhost',
  sessionFileStore: true/false
...
```

### Discord Stuff

The dashboard will never work without a few required settings. These include **Redirect URI**, **Client ID**, **Client Secret** and **Discord.js v12 Client**. We write more about them in the [Discord](#discord) section.

```js
const Discord = require('discord.js');
const DiscordClient = new Discord.Client();
DiscordClient.login('application_bot_token');
...

...
  client: {
    id: 'application_client_id',
    secret: 'application_client_secret'
  },
  redirectUri: 'http://localhost/discord/callback',
  bot: DiscordClient,
...
```

### Website Stuff

You can also change the name, icon, etc. of the page itself.

```js
...
  websiteTitle: 'Discord Web Dashboard',
  iconUrl: 'https://domain.com/icon.png',
...
```

### Themes

You can also use themes to change the look of the page. To do this, you need to use additional modules (CURRENTLY NOT AVAILABLE YET) and 'connect' them to the project.

If there are new themes, we'll write about them **here**, on [Discord Server](https://discord.gg/CHbfcSbEgd) and [Twitter](https://twitter.com/assistantsga).

```js
...
  theme: <ThemeModule>,
...
```

### Settings Stuff

Settings - that's what we called something that is basically the most important here. Settings are divided into Sections, and each Section has its own Options.

Sounds horrible, I know. Therefore, we have created a [Settings](#settings) section that describes everything.

```js
...
     settings: [
        {
            categoryId: 'setup',
            categoryName: "Setup",
            categoryDescription: "Setup your bot with default settings!",
            categoryOptionsList: [
                {
                    optionId: 'lang',
                    optionName: "Language",
                    optionDescription: "Change bot's language easily",
                    optionType: DBD.formTypes.select({"Polish": 'pl', "English": 'en'}),
                    getActualSet: async ({guild}) => {
                        const lang = await <db>.get(`${guild.id}.lang`);
                        return lang || null;
                    },
                    setNew: async ({guild,newData}) => {
                        await <db>.set(`${guild.id}.lang`, newData);
                        return;
                    }
                },
            ]
        },
    ]
...
```

## Settings

### Category

Each category has this something to it. It defines the settings sections. Because settings can be for different things, right? Therefore, the "Setup" and "Economy" sections will look separately in the basic panel like this:

![Image](https://assistants.ga/dashboard_tabs.png)

Cool is not it?

Each category is divided into:
* **categoryId**: It's a category ID. Ideally with basic characters (a-z, 0-9) to avoid bugs. The ID may also appear in the page URL.
* **categoryName**: The category name is displayed as the TAB name on the settings page.
* **categoryDescription**: The basic theme doesn't include this, but some may. This is a description of a section and its settings.
* **categoryOptionsList**: This is a list of all the options that can be put into a category. These are the options we call settings and want to change them, that's the purpose of the Dashboard. [The next part of the documentation](#options) is about the Options.

### Options

If you want the bot to be able to change the language by selecting it from the Select Box, you need to set it up. That's what Options are for.

* **optionId**: It's a option ID. Ideally with basic characters (a-z, 0-9) to avoid bugs. The ID may also appear in the page URL.
* **optionName**: That's the name of the option. It always appears in the settings TAB.
* **optionDescription**: That's the description of the option. It always appears in the settings TAB.
* **optionType**: This is very important because this is what defines the way data is received. Whether it should be textInput, input, selectBox or ToogleSwitch. You will establish it here. How? [We've documented it below](#option-types).
* **getActualSet**: It's an async function that is going to give us the data that is currently set to be able to display on the website. The type of data you should return depends on the optionType.
* **setNew**: This is an async/normal function that we call whenever someone changes the settings of this Option. We return in it: `{guild,user,newData}`, where guild and user are: `{id: guild / user ID}`. `guild#id` is the server affected by the change, and the `user#id` is the person who made the change. `newData` is the new data to which the Option applies.

## Option Types

What are the optionTypes? How to get them?

### How to get

The important thing is that option Types are contained in the module itself, not in the Dashboard. Therefore, to get them, you need to do this:

```js
const DBD = require('discord-dashboard');
...

...
  optionType: DBD.formTypes.input("Placeholder", 2, 5),
...
```

### Types available

Currently available types are:

#### Select
```js
...
  optionType: DBD.formTypes.select(list, disabled),
...
```

**list:** `{ displayName: valueReturned }` - required

**disabled:** Boolean (true/false) - optional

##### Returned data

String: selected item 'valueReturned' value

#### Input
```js
...
  optionType: DBD.formTypes.input(placeholder, min, max, disabled, required),
...
```

**placeholder:** String - optional

**min:** Number (*as min length*) - optional

**max:** Number (*as max length*) - optional

**disabled:** Boolean (true/false) - optional

**required:** Boolean (true/false) - optional

##### Returned data

String

#### Textarea
```js
...
  optionType: DBD.formTypes.textarea(placeholder, min, max, disabled, required),
...
```

**placeholder:** String - optional

**min:** Number - optional (*as min length*)

**max:** Number - optional (*as max length*)

**disabled:** Boolean (true/false) - optional

**required:** Boolean (true/false) - optional

##### Returned data

String

#### Switch
```js
...
  optionType: DBD.formTypes.switch(defaultState, disabled),
...
```

**defaultState:** Boolean (true/false) - optional

**disabled:** Boolean (true/false) - optional

##### Returned data

Boolean (true/false)

#### Guild Channels Select
```js
...
  optionType: DBD.formTypes.channelsSelect(disabled),
...
```

**disabled:** Boolean (true/false) - optional

##### Returned data

String (Channel ID)

#### Guild Roles Select
```js
...
  optionType: DBD.formTypes.rolesSelect(disabled),
...
```

**disabled:** Boolean (true/false) - optional

##### Returned data

String (Role ID)

## Discord

For the proper operation of the panel, you need a few previously mentioned Discord settings. It seems difficult, but it is not.

PS. Don't show this information to ANYONE. They are confidential and only for you.

### How to get

To get all of the required items listed below, you need to:
* Enter the site: https://discord.com/developers/applications
* Create new Application
* Continue for the selected option below:

#### Client ID

* Go to "OAuth2"
* Copy "Client ID"

#### Client Secret

* Go to "OAuth2"
* Copy "Client Secret"

#### Client Bot Token

* Go to "Bot"
* Create Bot
* Copy "TOKEN"

#### Redirect URI

* Go to "OAuth2"
* In place of Redirects, add your domain like http://domain.com/discord/callback or http://localhost/discord/callback (it can also be https, and if the port is other than 80 or 442 you must add it after the domain name [e.g. http://domain.com:245/discord/callback], 'domain.com' equals 'localhost' on local host)
* Save changes
* Redirect URI is this saved URL

# Full Example

```js
const DBD = require('discord-dashboard');

let langsSettings = {};

let currencyNames = {};

let botNicknames = {};

const Discord = require('discord.js');
const client = new Discord.Client();
client.login("botToken");

const Dashboard = new DBD.Dashboard({
    port: 80,
    client: {
        id: '849972188786065458',
        secret: 'clientSecret'
    },
    redirectUri: 'http://localhost/discord/callback',
    domain: 'http://localhost',
    bot: client,
    settings: [
        {
            categoryId: 'setup',
            categoryName: "Setup",
            categoryDescription: "Setup your bot with default settings!",
            categoryOptionsList: [
                {
                    optionId: 'lang',
                    optionName: "Language",
                    optionDescription: "Change bot's language easily",
                    optionType: DBD.formTypes.select({"Polish": 'pl', "English": 'en', "French": 'fr'}),
                    getActualSet: async ({guild}) => {
                        return langsSettings[guild.id] || null;
                    },
                    setNew: async ({guild,newData}) => {
                        langsSettings[guild.id] = newData;
                        return;
                    }
                },
                {
                    optionId: 'nickname',
                    optionName: "Nickname",
                    optionDescription: "Bot's nickname on the guild",
                    optionType: DBD.formTypes.input("Bot username", 1, 16, false, true),
                    getActualSet: async ({guild}) => {
                        return botNicknames[guild.id] || false;
                    },
                    setNew: async ({guild,newData}) => {
                        botNicknames[guild.id] = newData;
                        return;
                    }
                },
            ]
        },
        {
            categoryId: 'eco',
            categoryName: "Economy",
            categoryDescription: "Economy Module Settings",
            categoryOptionsList: [
                {
                    optionId: 'currency_name',
                    optionName: "Currency name",
                    optionDescription: "Economy module Guild currency name",
                    optionType: DBD.formTypes.input('Currency name', null, 10, false, true),
                    getActualSet: async ({guild}) => {
                        return currencyNames[guild.id] || null;
                    },
                    setNew: async ({guild,newData}) => {
                        currencyNames[guild.id] = newData;
                        return;
                    }
                },
            ]
        },
    ]
});

Dashboard.init();
```