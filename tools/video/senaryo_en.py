# İngilizce anlatım + Türkçe altyazı senaryosu → isler_en.json
# Satır biçimi: adım | İngilizce (seslendirilir) | Türkçe (ekranda). Türkçe boşsa İngilizce örnek cümledir.
# "S.A.T." harf harf okunur, ekranda "SAT" görünür.
import json, os

INTRO = "0|There's a mistake in this sentence. Can you spot it?|Bu cümlede bir hata var. Görebiliyor musun?"
OUTRO = ["5|One rule a day, with free practice.|Her gün bir kural, ücretsiz alıştırmalarla.",
         "5|Scorepath. Link in bio.|Scorepath. Link profilde."]

S = {
"01_b1": """
0|The museum closed early, the storm had cut the power.|
1|This sentence has two parts, and each one has its own subject and verb.|Bu cümlede iki parça var, ikisinin de öznesi ve yüklemi var.
1|So each part is a complete sentence on its own.|Yani ikisi de tek başına tam bir cümle.
2|Only a comma sits between them, and a comma can't join two complete sentences.|Aralarında sadece virgül var. Virgül iki tam cümleyi bağlayamaz.
2|This is called a comma splice, and the S.A.T. loves to test it.|Buna "comma splice" denir ve SAT bunu çok sorar.
3|The fix: a semicolon, a period, or a comma plus "and", "but", or "so".|Çözüm: noktalı virgül, nokta ya da virgül + and, but, so gibi bir bağlaç.
3|The museum closed early; the storm had cut the power.|
4|In short: two complete sentences can't be joined by a comma alone.|Kısaca: iki tam cümle, tek bir virgülle birleşmez.
""",
"02_b2": """
0|The trail is short but, it climbs steeply.|
1|Two complete sentences are joined with "but".|İki tam cümle "but" bağlacıyla birleşiyor.
2|The comma is in the wrong place. It comes after the conjunction.|Virgül yanlış yerde. Bağlacın arkasına konmuş.
3|The comma goes before the conjunction. First the comma, then "but".|Doğrusu: önce virgül, sonra "but".
3|The trail is short, but it climbs steeply.|
4|In short: when you join two sentences with "and", "but", "so", "yet", or "or", the comma comes first.|Kısaca: iki tam cümleyi and, but, so, yet, or ile bağlarken virgül bağlaçtan önce gelir.
""",
"03_b3": """
0|The recipe needs: flour, water, and salt.|
1|Look at the part before the colon: "The recipe needs." Needs what? The sentence is unfinished.|İki noktadan önceki kısma bak: "The recipe needs." Neye ihtiyaç var? Cümle yarım kalmış.
2|A colon can't come after an incomplete sentence.|Yarım cümleden sonra iki nokta konmaz.
3|First complete the sentence: "The recipe needs three ingredients." Now we can add the colon.|Önce cümleyi tamamla. Artık tam cümle, iki nokta koyabiliriz.
3|The recipe needs three ingredients: flour, water, and salt.|
4|In short: what comes before a colon must be a complete sentence.|Kısaca: iki noktadan önce, tek başına tam bir cümle olmalı.
""",
"04_b4": """
0|Because the soil was dry; the farmers waited.|
1|The first part starts with "because". It's a dependent clause, so it can't stand alone.|İlk kısım "because" ile başlıyor. Bu bir yan cümle, tek başına cümle olamaz.
2|A semicolon works like a period. It needs a complete sentence on both sides, and the left side isn't complete.|Noktalı virgül nokta gibidir, iki yanında da tam cümle ister. Burada sol taraf tam değil.
3|After a dependent clause, use a comma.|Yan cümleden sonra virgül kullanılır.
3|Because the soil was dry, the farmers waited.|
4|In short: both sides of a semicolon must be complete sentences.|Kısaca: noktalı virgülün iki tarafı da tam cümle olmalı.
""",
"05_b5": """
0|Kepler—who studied planets, was also an astrologer.|
1|"Who studied planets" is extra information. Remove it, and the sentence is still complete.|"who studied planets" kısmı ek bilgi. Çıkarsan cümle yine tam kalır.
2|The extra information opens with a dash but closes with a comma. The pair doesn't match.|Ek bilgi tireyle açılmış ama virgülle kapanmış. Çift uyuşmuyor.
3|Open with a dash, close with a dash. Open with a comma, close with a comma.|Tireyle açtıysan tireyle kapat, virgülle açtıysan virgülle.
3|Kepler—who studied planets—was also an astrologer.|
4|In short: extra information opens and closes with the same pair of marks.|Kısaca: ek bilgi bir çift işaretle açılır ve aynı işaretle kapanır.
""",
"06_b6": """
0|The comedian, Jemaine Clement, voiced the crab.|
1|If we only say "the comedian", we don't know which comedian. The name tells us who.|Sadece "the comedian" dersek hangi komedyen olduğunu bilemeyiz. İsim, kim olduğunu belirliyor.
2|Identifying information is essential, so it isn't set off with commas.|Belirleyici bilgi gerekli bilgidir, virgüllerle ayrılmaz.
3|We remove the commas, and the name sticks to the subject.|Virgülleri kaldırıyoruz, isim özneye yapışıyor.
3|The comedian Jemaine Clement voiced the crab.|
4|In short: information that identifies who you mean takes no commas. A clause starting with "that" never takes commas either.|Kısaca: kimden bahsedildiğini belirleyen bilgi virgülsüz yazılır. "that" ile başlayan kısım da her zaman virgülsüz.
""",
"07_b7": """
0|The scientists who studied the samples, concluded that the rocks were volcanic.|
1|The subject is long: "the scientists who studied the samples". When it's long, a comma feels tempting.|Özne uzun: "the scientists who studied the samples". Uzun olunca araya virgül koymak cazip geliyor.
2|But no punctuation goes between a subject and its verb.|Ama özne ile yüklemin arasına hiçbir noktalama girmez.
3|We delete the comma. The subject connects directly to the verb.|Virgülü siliyoruz. Özne doğrudan yükleme bağlanır.
3|The scientists who studied the samples concluded that the rocks were volcanic.|
4|In short: no punctuation between subject and verb, or between verb and object.|Kısaca: özne ile yüklem, yüklem ile nesne arasında noktalama yok.
""",
"08_b8": """
0|They asked how could the lake be saved?|
1|"They asked how" reports a question; it doesn't ask one directly. This is an indirect question.|Bu doğrudan bir soru değil, bir sorunun aktarılması. Buna dolaylı soru denir.
2|An indirect question doesn't use question word order, and it doesn't take a question mark.|Dolaylı soruda soru sırası kullanılmaz ve soru işareti konmaz.
3|Use normal order: "the lake could", and end with a period.|Normal cümle sırası: "the lake could". Sonuna da nokta.
3|They asked how the lake could be saved.|
4|In short: after "asked how", "wondered why", or "whether", use normal sentence order and end with a period.|Kısaca: asked how, wondered why, whether ile gelen kısım düz cümle sırasıyla yazılır ve nokta ile biter.
""",
"09_b9": """
0|After the storm passed the crew repaired the roof.|
1|The sentence opens with an introduction: "after the storm passed". The main sentence is "the crew repaired the roof".|Cümle "after the storm passed" diye bir girişle başlıyor. Asıl cümle: "the crew repaired the roof".
2|Something is missing where the introduction ends.|Girişin bittiği yerde bir işaret eksik.
3|We put a comma after the introduction.|Girişten sonra virgül koyuyoruz.
3|After the storm passed, the crew repaired the roof.|
4|In short: an introduction starting with "after", "although", "because", or "to" is followed by a comma.|Kısaca: after, although, because ya da to ile başlayan girişten sonra virgül gelir.
""",
"10_b10": """
0|The kit includes, a map, a compass, and a whistle.|
1|Here we have a list of three items: a map, a compass, a whistle.|Burada üç öğeli bir liste var: a map, a compass, a whistle.
2|There's a comma before the first item. That's wrong.|Listenin ilk öğesinden önce virgül konmuş. Bu yanlış.
3|Put commas between the items, but not before the first one.|Öğelerin arasına virgül koy, ama ilk öğeden önce koyma.
3|The kit includes a map, a compass, and a whistle.|
4|In short: separate list items with commas. No comma as you enter the list.|Kısaca: liste öğelerini virgülle ayır. Listeye girerken virgül yok.
""",
"11_f1": """
0|The collection of ancient coins are displayed.|
1|What is displayed? The collection. The real subject is "collection", and it's singular.|Ne sergileniyor? Koleksiyon. Gerçek özne "collection", yani tekil.
2|"Of ancient coins" is plural, so "are" was used. That's the trap.|Araya giren "of ancient coins" çoğul olduğu için "are" yazılmış. Tuzak bu.
3|Ignore the middle part and look at the subject: "the collection is".|Araya gireni yok say, özneye bak: "the collection is".
3|The collection of ancient coins is displayed.|
4|In short: ignore the phrase starting with "of", and match the verb to the real subject.|Kısaca: "of" ile başlayan kısmı yok say, yüklemi gerçek özneye uydur.
""",
"12_f2": """
0|Using public domain songs ensure that the film is legal.|
1|The subject starts with "using". So the subject is an action: using the songs.|Öznenin başında "using" var. Yani özne bir eylem: şarkıları kullanmak.
2|"Songs" is plural, so "ensure" was used. But the subject is one action.|"songs" çoğul diye "ensure" yazılmış. Ama özne tek bir eylem.
3|We use a singular verb: "ensures".|Tekil yüklem kullanıyoruz: "ensures".
3|Using public domain songs ensures that the film is legal.|
4|In short: a subject starting with an "-ing" word or with "to" is singular.|Kısaca: -ing ya da "to" ile başlayan özne tekildir.
""",
"13_f3": """
0|The committee released their report.|
1|"The committee" is one group, even with many people in it. It's singular.|"The committee", yani kurul. İçinde çok kişi olsa da tek bir grup. Tekil.
2|"Their" is a plural pronoun. It doesn't match a singular noun.|"Their" çoğul zamir. Tekil isme uymaz.
3|For a singular noun, we use "its".|Tekil isim için "its" kullanıyoruz.
3|The committee released its report.|
4|In short: a pronoun must match its noun in number. For company, team, or committee, use "it" and "its".|Kısaca: zamir, yerini tuttuğu isimle sayıca aynı olmalı. company, team, committee için "it" ve "its".
""",
"14_f4": """
0|The octopus can change it's color.|
1|We mean the octopus's color. So this is possession.|Burada ahtapotun rengi kastediliyor. Yani sahiplik var.
2|"It's" means "it is". "It is color" makes no sense.|"It's", yani "it is". "It is color" anlamsız.
3|For possession, use "its" with no apostrophe.|Sahiplik için kesme işaretsiz "its".
3|The octopus can change its color.|
4|In short: "its" shows possession, "it's" means "it is". "Their" is possession, "there" is a place, "they're" means "they are".|Kısaca: its = onun, it's = it is. their = onların, there = orada, they're = they are.
""",
"15_f5": """
0|Place your hand's on the table.|
1|Here the hands don't own anything. They're just plural.|Burada eller hiçbir şeye sahip değil. Sadece çoğul.
2|An apostrophe shows possession. No possession, no apostrophe.|Kesme işareti sahiplik gösterir. Sahiplik yoksa konmaz.
3|We just add an "s": "hands".|Sadece s ekliyoruz: "hands".
3|Place your hands on the table.|
4|In short: singular possession is apostrophe s, plural is just s, plural possession is s apostrophe.|Kısaca: tekil sahiplikte 's, çoğulda sadece s, çoğul sahiplikte s'.
""",
"16_f6": """
0|In 2023, the team publishing a study.|
1|The subject is "the team". So what did the team do?|Özne "the team". Peki takım ne yaptı?
2|"Publishing" can't be the main verb on its own. The sentence is incomplete.|"Publishing" tek başına yüklem olamaz. Cümle yarım kalıyor.
3|We need a real, conjugated verb: "published".|Çekimli bir yüklem lazım: "published".
3|In 2023, the team published a study.|
4|In short: every sentence needs a conjugated verb. An "-ing" word, "to", or "having" alone isn't enough.|Kısaca: her cümlenin çekimli bir yüklemi olmalı. -ing, to ve having tek başına yetmez.
""",
"17_f7": """
0|A decade later, Land uses the filter.|
1|"A decade later" describes something that happened in the past. The text is in the past tense.|"A decade later" geçmişte olmuş bir olayı anlatıyor. Metin geçmiş zamanda.
2|"Uses" is present tense. It doesn't match the text.|"Uses" geniş zaman. Metnin zamanıyla uyuşmuyor.
3|We use the past tense: "used".|Geçmiş zaman kullanıyoruz: "used".
3|A decade later, Land used the filter.|
4|In short: find the time clue. "In 1939" means past, "each night" means present, and "by the time" means "had".|Kısaca: zaman ipucunu bul. "In 1939" geçmiş zaman, "each night" geniş zaman, "by the time" ise "had".
""",
"18_f8": """
0|Using a telescope, a comet was spotted.|
1|"Using a telescope" means someone is using a telescope. So who is using it?|"Using a telescope", yani teleskop kullanarak. Peki teleskobu kim kullanıyor?
2|Right after the comma comes "a comet". A comet can't use a telescope.|Virgülden hemen sonra "a comet" gelmiş. Kuyruklu yıldız teleskop kullanamaz.
3|The person doing the action must come right after the comma: the astronomer.|Virgülden sonra işi yapan kişi gelmeli: the astronomer.
3|Using a telescope, the astronomer spotted a comet.|
4|In short: after an opening phrase, the one doing the action comes right after the comma.|Kısaca: giriş ifadesinden sonra, virgülün hemen arkasına o işi yapan gelir.
""",
}

HERE = os.path.dirname(os.path.abspath(__file__))
old = {j["id"]: j for j in json.load(open(os.path.join(HERE, "isler.json"), encoding="utf-8"))}
jobs = []
for jid, body in S.items():
    lines = [INTRO] + [l for l in body.strip().splitlines()] + OUTRO
    seg = []
    for l in lines:
        st, en, tr = l.split("|")
        seg.append({"t": en, "tr": tr or None, "l": "en", "step": int(st)})
    jobs.append({"id": jid, "rule": old[jid]["rule"], "seg": seg})
assert [j["id"] for j in jobs] == list(old)
json.dump(jobs, open(os.path.join(HERE, "isler_en.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(jobs), "video,", sum(len(j["seg"]) for j in jobs), "parça")
