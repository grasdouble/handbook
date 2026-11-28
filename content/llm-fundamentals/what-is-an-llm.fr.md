### Définition

Un **grand modèle de langage** (LLM, pour *Large Language Model*) est un modèle d’IA qui traite et génère du texte à partir d’un contexte.

> **En résumé**  
> Un LLM apprend des régularités du langage en prédisant le prochain token. Il utilise ensuite ces régularités pour produire une suite plausible, pas pour vérifier les faits.

### Comment ça fonctionne ?

Pour un LLM qui génère du texte, l’apprentissage et la génération se déroulent en quatre étapes :

<!-- guide-steps -->

1. **Données**  
   Des textes sont découpés en tokens.
2. **Entraînement**  
   Le modèle apprend à prédire le token suivant.
3. **Prédiction**  
   À partir du contexte, le modèle estime des probabilités et choisit un token.
4. **Génération**  
   Le token enrichit le contexte, puis le modèle répète la prédiction.

Vous ouvrez un chatbot parce que la page blanche est en train de gagner. Il vous rend un email correct en dix secondes, puis arrive la partie agaçante : tout le monde appelle cette magie « un LLM » et passe à autre chose. Si cet acronyme vous semble flou, tant mieux. Il cache souvent la seule idée qui compte vraiment.

### Un LLM est d'abord une machine à texte

Voici la définition que je choisirais : un **LLM** est un **modèle**, c'est-à-dire un système mathématique dont le comportement vient de **paramètres** appris, des valeurs numériques ajustables ; il travaille sur le **langage**, donc sur du texte ; et il est **large** parce que ce système peut contenir des milliards de paramètres. L'article sur [GPT-3](https://arxiv.org/abs/2005.14165) donne un ordre de grandeur concret : GPT-3 avait 175 milliards de paramètres.

Cette définition reste abstraite, donc la bonne question suivante est simple : qu'est-ce qu'une aussi grosse machine à texte apprend vraiment à faire ? Pas à « tout savoir ». Sa tâche centrale est bien plus étroite.

### Il apprend en devinant la suite du texte

Pendant l'entraînement, un LLM apprend à prédire le morceau de texte suivant à partir du contexte précédent, le principe de base décrit dans [Attention Is All You Need](https://arxiv.org/abs/1706.03762). L'unité qu'il prédit s'appelle un **token**, un petit morceau de texte qui peut être un mot entier, un fragment de mot ou un signe de ponctuation. Le [Tokenizer](https://platform.openai.com/tokenizer) d'OpenAI permet de le voir en quelques secondes.

C'est le point que les débutants sous-estiment souvent. En devenant très bon à la prédiction du token suivant sur d'immenses corpus, le modèle apprend la grammaire, le style, des faits fréquents et beaucoup de régularités du langage. C'est pour cela que le même outil peut rédiger un email, réécrire un paragraphe ou expliquer une notion plus simplement sans changer de cerveau.

### Pourquoi cela donne une impression d'intelligence

L'architecture Transformer compte parce qu'elle aide le modèle à utiliser le contexte au lieu de traiter chaque mot séparément. Le modèle mental que je préfère n'est ni « une petite personne dans une boîte » ni « un moteur de recherche avec des opinions ». C'est « une autocomplétion extrêmement puissante ». Cette comparaison est utile parce qu'elle explique à la fois la partie impressionnante et la partie risquée.

### La règle que j'utiliserais

Si votre tâche consiste surtout à façonner du langage, commencez par un LLM. Si elle repose surtout sur des faits vérifiés, des événements récents ou des décisions à fort enjeu, traitez le LLM comme un premier brouillon et allez chercher une source fiable avant d'y croire. La raison est simple : le modèle est entraîné à produire une suite plausible, pas à vérifier des faits. Le guide suivant sur la génération token par token détaille ce mécanisme et explique pourquoi ces systèmes cessent d'avoir l'air mystiques une fois qu'on l'a vu.

### À retenir

- Un LLM traite et génère du texte en s’appuyant sur le contexte.
- L’entraînement sur de grands corpus lui apprend à prédire le prochain token.
- La plupart des LLM modernes reposent sur l’architecture Transformer.
