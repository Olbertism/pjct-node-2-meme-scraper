# README

CLI program to generate and download memes including batch download of existing memes

## How to

```
$ node index.js
```

Scrapes the first 10 pictures from a shady website and saves them into "meme" folder in your project directory.

```
$ node index.js id text-upper text-lower
```

Generate a meme by referencing an id, including an optional upper and optional lower text. Use hyphens instead of spaces inside the texts, e.g. "thats-how-you-get-ants" (turns to -> "thats how you get ants)

```
$ node index.js template-ls
```

Output a list of all available templates in the console. The fist part is the ID, the second part the meme name
