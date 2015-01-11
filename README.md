# WEDT
Paragraph finding

Zależności:
Konwersja plików do plain text przy użyciu modułów/programów:
	pdf - https://github.com/euske/pdfminer/ 
	odt - https://github.com/dstosberg/odt2txt/
	html - http://www.crummy.com/software/BeautifulSoup/
	doc - http://www.winfield.demon.nl/
	rtf - https://pypi.python.org/pypi/pyth/

[TASK] Zgrubny podział tekstu paragrafy. Paragraf kończy się ciągiem znaków "(' ''\t')*\n(' ''\t''\r')*(' ''\t')*\n"

[TASK] Połączenie paragrafów o zbyt małej ilości znaków, krótszej niż połowa lini:
	a) w dół - jest jednym z nagłówków specjalnych, 
		 - jest pisany wielkimi literami 
	b) w gorę - w przeciwnym razie

[TASK] Połączenie paragrafów kończących się dwukropkiem z kolejnymi pragrafami zaczynającymi się małą literą.

[TASK] Połączenie paragrafów kończących się ',', '-' lub bez kropki z paragrafami zaczynającymi się małą literą.

[TASK] Usunięcie nagłówków na początku stron.
