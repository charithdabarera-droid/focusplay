# Walle content credits and licences

All content is bundled read-only JSON. Nothing is generated at runtime and nothing is sent anywhere.

- **English words** (`words/en.json`): definitions and many examples from **Princeton WordNet 3.0** (WordNet licence, permissive, © Princeton University). Pronunciation hints derived from the **CMU Pronouncing Dictionary** (BSD-style licence). Levels by word frequency from **wordfreq** (Robyn Speer; data CC BY-SA 4.0). Extra example sentences from **Tatoeba** (CC BY 2.0 FR).
- **Other-language words** (`words/fr|es|de|it|pt|ja|zh|ko|ar.json`): glosses, IPA, romanisation and examples extracted from **English Wiktionary** via **Kaikki.org / wiktextract** (Tatya Ylonen) — **CC BY-SA 4.0 and GFDL**. Frequency ranking from **wordfreq**. Missing examples were filled with **Tatoeba** sentence pairs (CC BY 2.0 FR). Entries without a verified example show meaning and pronunciation only.
- **Phrases** (`phrases/*.json`): sentence pairs from the **Tatoeba Project** (tatoeba.org, CC BY 2.0 FR), via ManyThings.org Anki exports which keep per-sentence attribution. Japanese romaji generated with **pykakasi**, Chinese pinyin with **pypinyin**, Korean with a simple Revised-Romanization letter mapping (approximate; no sound-change rules).
- **Quotes** (`quotes.json`): verbatim sentences from **public-domain** Project Gutenberg editions: Marcus Aurelius, *Meditations* (tr. George Long); Epictetus, *Enchiridion* (tr. T. W. Higginson) and *Discourses* (tr. George Long); Seneca (tr. Roger L’Estrange); Lao Tzu, *Tao Te Ching* (tr. James Legge); Confucius, *Analects* (tr. James Legge); Sun Tzu, *The Art of War* (tr. Lionel Giles); Emerson, *Essays* and *The Conduct of Life*; Thoreau, *Walden*; William James, *Talks to Teachers*; James Allen, *As a Man Thinketh*; Francis Bacon, *Essays*; Samuel Smiles, *Self-Help*; Aristotle, *Nicomachean Ethics* (tr. D. P. Chase); Boethius (tr. H. R. James); La Rochefoucauld, *Maxims* (1871 tr.); Benjamin Franklin, *The Way to Wealth*; Schopenhauer, *Counsels and Maxims* (tr. T. Bailey Saunders). Every quote was matched against the source text; none are paraphrased or invented.

ShareAlike note: the Wiktionary-derived word files are redistributed under CC BY-SA 4.0.


## Word-of-the-day levelling method (v1.1.1)

**English (`words/en.json`).** Levels follow the CEFR. Beginner = A1–A2, Intermediate = B1–B2, Advanced = C1–C2. They come from the **CEFR-J Wordlist 1.5** (A1–B2, Tono Lab / CEFR-J, used under its terms with attribution) plus the **Octanove C1/C2 vocabulary list** (CC BY-SA 4.0).
- Very common words are not allowed in a higher level: an Advanced word is skipped if its *wordfreq* Zipf score is above 4.3, and an Intermediate word is skipped above 5.3. Numbers and function words are kept at Beginner.
- **Meanings** use the first, most common modern sense from **Simple English Wiktionary** (via Kaikki.org, CC BY-SA). These glosses are written for learners. The example must be a complete sentence in the same sense, contain the word, and have at least 4 words.
- If no learner gloss exists for an Advanced word, it falls back to the **WordNet 3.0** sense with the highest SemCor count. That is used only when a full-sentence example for the same sense exists. Abstract templates ("In a … manner", "Of or relating to", "The property of being …") are rejected.
- **Respelling** comes from the **CMU Pronouncing Dictionary**. Rules: syllables are hyphenated with maximal onset, the stressed syllable is in CAPITALS (for example responsive → rih-SPON-siv, eighty → AY-tee), and the dictionary variant is chosen by part of speech. In v1.1.1 all Advanced entries and a random sample of 320 Beginner/Intermediate entries were reviewed by hand; weak or dictionary-style meanings were rewritten as plain modern learner definitions with natural example sentences, and 170+ respellings were hand-checked and corrected.

**Japanese.** JLPT lists from the open-anki-jlpt-decks (MIT): N5–N4 → Beginner, N3–N2 → Intermediate, N1 → Advanced. Examples come from Tatoeba (CC BY 2.0 FR). Romaji is generated.

**Chinese.** New HSK lists (drkameleon/complete-hsk-vocabulary, MIT): HSK 1–2 → Beginner, 3–4 → Intermediate, 5–6 → Advanced. Pinyin is from the list; examples come from Tatoeba.

**French, Spanish, German, Italian, Portuguese, Korean and Arabic.** No open CEFR-graded list was available, so levels are **frequency bands** (wordfreq rank, split into thirds of the curated list: most frequent → Beginner). Glosses and examples come from English Wiktionary via Kaikki.org (CC BY-SA 4.0).

**QA (automated, every release).** These checks run on every release:
- advanced entries that are numbers or function words, or too common;
- duplicate words;
- empty fields;
- examples that do not contain the word (stem- and diacritic-aware for Arabic);
- odd respellings.

Flagged items are removed, and 0 flags remain in the shipped files.

**Extra examples (German, Italian, Arabic).** Missing examples were filled from Tatoeba sentence pairs (CC BY 2.0 FR, via ManyThings.org). A sentence is used only if the headword appears in it as a whole word (case-sensitive for German; Arabic ignores diacritics and allows the clitics و ف ب ل ال) and its English translation shares a key word with the gloss, so the sentence uses the same sense.
