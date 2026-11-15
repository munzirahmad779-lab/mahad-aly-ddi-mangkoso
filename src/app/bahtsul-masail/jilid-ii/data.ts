// Data ketetapan Bahtsul Masa'il Jilid II, ditranskripsikan dari dokumen
// resmi SK Ketua Panitia Bahtsul Masa'il Nomor 276/SK/Pan-BM/III/1448.
// Teks ibarah Arab pada bagian Referensi disalin dari tampilan halaman
// dokumen resmi (lapisan teks PDF merusak susunan huruf Arabnya).

export interface SoalJawab {
  tanya: string[];
  jawab: string[];
  referensi: string[];
}

export interface MasailItem {
  nomor: number;
  slug: string;
  judulSingkat: string;
  judul: string;
  headline?: string;
  spoiler: string;
  pdf: string;
  deskripsi: string[];
  soal: SoalJawab[];
}

export const PDF_SK_LENGKAP =
  "https://drive.google.com/uc?export=download&id=1kKC68sELl-mkCgl6lrGi9ktt_0DDj794";

export const MASAIL: MasailItem[] = [
  {
    "deskripsi": [
      "Dalam praktik zakat mal di Indonesia, nisab harta simpanan, uang, dan penghasilan umumnya dikaitkan dengan 85 gram emas. Namun, kenaikan harga emas membuat nilai nisab dalam rupiah terus naik, sehingga ambang wajib zakat semakin tinggi dan sebagian orang, yang sebenarnya mampu, tidak lagi terkena kewajiban zakat.",
      "Di sisi lain, muncul perbedaan standar emas untuk nisab. Sebagian kalangan menggunakan emas murni 24 karat, sementara yang lain memakai emas 14 karat demi kemudahan implementasi. Isu ini menjadi pembahasan dalam Komisi Bahtsul Masail Waqi'iyah Munas/Konbes NU 2026 tentang standarisasi kadar emas untuk nisab zakat mal.",
      "Persoalan ini juga memunculkan pertanyaan fikih: Apakah zakat harta kontemporer seperti uang dan tabungan harus selalu diukur dengan nisab emas, ataukah boleh memakai nisab perak yang nilainya jauh lebih rendah? Jika memakai emas, standar mana yang muktabar secara fikih; dan apakah ada ruang memilih standar yang lebih menguntungkan fuqarā' sesuai maqāṣid az-zakāh?"
    ],
    "soal": [
      {
        "tanya": [
          "Dalam penetapan nisab zakat mal atas uang, tabungan, dan harta simpanan, apakah wajib mengikuti nisab emas atau boleh mengikuti nisab perak?"
        ],
        "jawab": [
          "Tidak wajib.",
          "Perincian: Emas atau perak dapat digunakan atau dijadikan patokan dalam menetapkan nisab zakat uang. Namun, jika merujuk pada dalil yang ada, maka emaslah yang lebih afdal/utama digunakan sesuai dengan pandangan ulama klasik. Akan tetapi ada hal yang harus digaris bawah berpatokan dengan pandangan ulama yang mengharuskan memakai nisab emas kurang relevan lagi untuk saat ini.",
          "Mayoritas ulama kontemporer lebih condong kepada adnā an-niṣābayni (nisab terendah). Pendapat ini didasarkan pada tinjauan sisi maṣlahah/maqāṣid az-zakāh (tujuan zakat), dengan pertimbangan bahwa kalau yang dijadikan nisab adalah emas, maka prosentase orang berzakat akan sangat rendah, disebabkan tingginya harga emas. Sedangkan jika menggunakan nisab perak, maka akan lebih menguntungkan fuqara'/mustahiq (fakir/yang berhak menerima zakat).",
          "Kesimpulan: a. Penggunaan nisab emas sebagai nisab zakat uang lebih afdhal, tetapi kurang relevan untuk saat ini. b. Penggunaan nisab perak dianggap lebih relevan untuk saat ini, karena lebih menguntungkan fuqara'/mustahiq."
        ],
        "referensi": [
          "قال الإمام النووي رحمه الله في المجموع شرح المهذب ج. 5، ص. 503-504، طبعة مكتبة الإرشاد جدة:",
          "وَأَمَّا الذَّهَبُ فَقَدْ ذَكَرْنَا أَنَّ مَذْهَبَنَا أَنَّ نِصَابَهُ عِشْرُونَ مِثْقَالًا، وَيَجِبُ فِيمَا مَا زَادَ بِحِسَابِهِ رُبْعُ الْعُشْرِ، قَلَّتِ الزِّيَادَةُ أَمْ كَثُرَتْ. وَبِهِ قَالَ الْجُمْهُورُ مِنَ السَّلَفِ وَالْخَلَفِ. وَقَالَ ابْنُ الْمُنْذِرِ أَجْمَعُوا عَلَى أَنَّ الذَّهَبَ إِذَا كَانَ عِشْرِينَ مِثْقَالًا وَقِيمَتُهَا مَائَتَا دِرْهَمٍ وَجَبَتْ فِيهِ الزَّكَاةُ إِلَّا مَا اخْتُلِفَ فِيهِ عَنِ الْحَسَنِ، فَرُوِيَ عَنْهُ هَذَا وَرُوِيَ عَنْهُ أَنَّهُ لَا زَكَاةَ فِيمَا هُوَ دُونَ أَرْبَعِينَ مِثْقَالًا لَا تُسَاوِي مَائَتَيْ دِرْهَمٍ. وَفِي دُونِ عِشْرِينَ إِذَا سَاوَى مَائَتَيْ دِرْهَمٍ، فَقَالَ كَثِيرٌ مِنْهُمْ لَا زَكَاةَ فِيمَا دُونَ عِشْرِينَ وَإِنْ بَلَغَتْ مَائَتَيْ دِرْهَمٍ، وَتَجِبُ فِي عِشْرِينَ وَإِنْ لَمْ تَبْلُغْهَا. مِمَّنْ قَالَ بِهِ عَلِيُّ بْنُ أَبِي طَالِبٍ وَعُمَرُ بْنُ عَبْدِ الْعَزِيزِ وَابْنُ سِيرِينَ وَعُرْوَةُ وَالنَّخَعِيُّ وَالْحَكَمُ وَمَالِكٌ وَالثَّوْرِيُّ وَالْأَوْزَاعِيُّ وَاللَّيْثُ وَالشَّافِعِيُّ وَأَبُو حَنِيفَةَ وَأَبُو يُوسُفَ وَمُحَمَّدٌ وَأَحْمَدُ وَإِسْحَاقُ وَأَبُو ثَوْرٍ وَأَبُو عُبَيْدٍ. وَقَالَ طَاوُسٌ وَعَطَاءٌ وَالزُّهْرِيُّ وَأَيُّوبُ وَسُلَيْمَانُ بْنُ حَرْبٍ يَجِبُ رُبْعُ الْعُشْرِ فِي الذَّهَبِ إِذَا بَلَغَتْ قِيمَتُهُ مَائَتَيْ دِرْهَمٍ، وَإِنْ كَانَ دُونَ عِشْرِينَ مِثْقَالًا. فَلَا شِئَ فِي الزِّيَادَةِ حَتَّى تَبْلُغَ أَرْبَعَةَ دَنَانِيرَ.",
          "قال أحمد الزرقا رحمه الله في شرح القواعد الفقهية، ص. 227، طبعة دار القلم دمشق:",
          "لَا يُنْكَرُ تَغَيُّرُ الْأَحْكَامِ بِتَغَيُّرِ الْأَزْمَانِ، أَيْ بِتَغَيُّرِ عُرْفِ أَهْلِهَا وَعَادَتِهِمْ، فَإِذَا كَانَ عُرْفُهُمْ وَعَادَتُهُمْ يَسْتَدْعِيَانِ حُكْمًا ثُمَّ تَغَيَّرَا إِلَى عُرْفٍ وَعَادَةٍ أُخْرَى فَإِنَّ الْحُكْمَ يَتَغَيَّرُ إِلَى مَا يُوَافِقُ مَا انْتَقَلَ إِلَيْهِ عُرْفُهُمْ وَعَادَتُهُمْ."
        ]
      },
      {
        "tanya": [
          "Jika memakai emas, standar mana yang muktabar secara fikih: emas murni 24 karat atau emas 14 karat?"
        ],
        "jawab": [
          "Bila kadar kemurnian zakat diikutkan kepada zaman Nabi shallahu alaihi wasallam, maka tentu tak ada yang sesuai, baik 24 karat, apatah lagi 14 karat. Namun kadar yang lebih mendekati emas murni adalah emas 24 karat. Sehingga emas kadar 24 karat paling mendekati emas murni dan paling sesuai untuk dijadikan standar muktabar secara fikih."
        ],
        "referensi": [
          "قال النووي رحمه الله في المجموع شرح المهذب ج. 5، ص. 505، طبعة مكتبة الإرشاد جدة:",
          "قَدْ ذَكَرْنَا أَنَّ مَذْهَبَنَا أَنَّهُ لَا زَكَاةَ فِي الْمَغْشُوشِ مِنْ ذَهَبٍ وَلَا فِضَّةٍ حَتَّى يَبْلُغَ خَالِصُهُ نِصَابًا، وَبِهِ قَالَ جُمْهُورُ الْعُلَمَاءِ. وَقَالَ أَبُو حَنِيفَةَ: إِنْ كَانَ الْغِشُّ مِثْلَ نِصْفِ الْفِضَّةِ أَوِ الذَّهَبِ أَوْ أَكْثَرَ فَلَا زَكَاةَ حَتَّى يَبْلُغَ الْخَالِصُ نِصَابًا، وَإِنْ كَانَ أَقَلَّ وَجَبَتِ الزَّكَاةُ إِذَا بَلَغَ بِغِشِّهِ نِصَابًا، بِنَاءً عَلَى أَصْلِهِ أَنَّ الْغِشَّ إِذَا نَقَصَ عَنِ النِّصْفِ سَقَطَ حُكْمُهُ حَتَّى لَوِ اقْتَرَضَ عَشَرَةَ دَرَاهِمَ لَا غِشَّ فِيهَا فَرَدَّ عَشَرَةً فِيهَا سِتَّةٌ فِضَّةٌ وَالْبَاقِي غِشٌّ لَزِمَ الْمُقْرِضَ قَبُولُهَا وَيَبْرَأُ الْمُقْتَرِضُ بِهَا. وَلَوْ مَلَكَ مَائَتَيْنِ خَالِصَةً فَأَخْرَجَ زَكَاتَهَا خَمْسَةً مَغْشُوشَةً قَالَ تَجْزِيهِ. قَالَ الْمَاوَرْدِي: وَفَسَادُ هَذَا الْقَوْلِ ظَاهِرٌ وَالِاحْتِجَاجُ عَلَيْهِ تَكَلُّفٌ. وَيَكْفِي فِي رَدِّهِ قَوْلُهُ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ (لَيْسَ فِيمَا دُونَ خَمْسِ أَوَاقٍ مِنَ الْوَرِقِ صَدَقَةٌ).",
          "قال ابن حجر الهيتمي رحمه الله في المنهج القويم بشرح مسائل التعليم، ص. 373، طبعة دار المنهاج جدة، 2006:",
          "(ولا شيء في المغشوش) من الذهب والفضة (حتى يبلغ خالصه نصابا) فحينئذ يخرج خالصا أو مغشوشا خالصه قدر الزكاة، ويكون متطوعا بالغش."
        ]
      },
      {
        "tanya": [
          "Apakah ada ruang fikih untuk memilih standar yang lebih menguntungkan orang fakir dan sesuai dengan maqāṣid az-zakāh?"
        ],
        "jawab": [
          "Tentu ada ruang fikih untuk memilih standar yang lebih menguntungkan orang-orang fakir, karena maqāṣid az-zakāh (maksud peruntukkan zakat) itu sendiri ialah kemaslahatan mustahiq."
        ],
        "referensi": [
          "قال ابن قدامة المقدسي رحمه الله في المغني ج. 5، ص. 253، طبعة دار عالم الكتب الرياض:",
          "مَسْأَلَةٌ: قَالَ: وَتُقَوَّمُ السِّلَعُ إِذَا حَالَ الْحَوْلُ بِالْأَحَظِّ لِلْمَسَاكِينِ، مِنْ عَيْنٍ أَوْ وَرِقٍ، وَلَا يُعْتَبَرُ مَا اشْتُرِيَتْ بِهِ يَعْنِي إِذَا حَالَ الْحَوْلُ عَلَى الْعُرُوضِ وَقِيمَتُهَا بِالْفِضَّةِ نِصَابٌ، وَلَا تَبْلُغُ نِصَابًا بِالذَّهَبِ قَوَّمْنَاهَا بِالْفِضَّةِ، لِيَحْصُلَ لِلْفُقَرَاءِ مِنْهَا حَظٌّ، وَلَوْ كَانَتْ قِيمَتُهَا بِالْفِضَّةِ دُونَ النِّصَابِ وَبِالذَّهَبِ تَبْلُغُ نِصَابًا، قَوَّمْنَاهَا بِالذَّهَبِ؛ لِتَجِبَ الزَّكَاةُ فِيهَا. وَلَا فَرْقَ بَيْنَ أَنْ يَكُونَ اشْتِرَاؤُهَا بِذَهَبٍ أَوْ فِضَّةٍ أَوْ عُرُوضٍ. وَبِهَذَا قَالَ أَبُو حَنِيفَةَ.",
          "وَقَالَ الشَّافِعِيُّ: تُقَوَّمُ بِمَا اشْتَرَاهُ مِنْ ذَهَبٍ أَوْ فِضَّةٍ؛ لِأَنَّ نِصَابَ الْعُرُوضِ مَبْنِيٌّ عَلَى مَا اشْتَرَاهُ بِهِ، فَيَجِبُ أَنْ تَجِبَ الزَّكَاةُ فِيهِ، وَتُعْتَبَرُ بِهِ كَمَا لَوْ لَمْ يَشْتَرِ بِهِ شَيْئًا. وَلَنَا أَنَّ قِيمَتَهُ بَلَغَتْ نِصَابًا فَتَجِبُ الزَّكَاةُ فِيهِ، كَمَا لَوِ اشْتَرَاهُ بِعَرْضٍ وَفِي الْبَلَدِ نَقْدَانِ مُسْتَعْمَلَانِ، تَبْلُغُ قِيمَةُ الْعُرُوضِ بِأَحَدِهِمَا نِصَابًا، وَلِأَنَّ تَقْوِيمَهُ لِحَظِّ الْمَسَاكِينِ، فَيُعْتَبَرُ مَا لَهُمْ فِيهِ الْحَظُّ كَالْأَصْلِ.",
          "قال المرغيناني رحمه الله في الهداية شرح بداية المبتدي ج. 2، ص. 194، طبعة دار السراج المدينة المنورة، 2019:",
          "قال: (الزكاة واجبة في عروض التجارة، كائنة ما كانت، إذا بلغت قيمتها نصابا من الورق أو الذهب)، لقوله عليه الصلاة والسلام فيها: (يقومها فيؤدي من كل مائتي درهم خمسة دراهم)، ولأنها معدة للاستنماء بإعداد العبد فأشبه المعد بإعداد الشرع. وتشترط نية التجارة ليثبت الإعداد.",
          "ثم قال: (يقومها بما هو أنفع للمساكين منهما)، احتياطا لحق الفقراء. قال رضي الله عنه: وهذا رواية عن أبي حنيفة رحمه الله. وفي الأصل: خيره، لأن الثمنين في تقدير قيم الأشياء بهما سواء. وتفسير الأنفع أن يقومها بما يبلغ نصابا.",
          "قال الشاطبي رحمه الله في الموافقات، ج. 3، ص. 120-121، طبعة دار ابن عفان السعودية، 1997:",
          "الْمَسْأَلَةُ الثَّانِيَةُ عَشْرَةَ: مَا ثَبَتَ أَنَّ الْأَحْكَامَ شُرِعَتْ لِمَصَالِحِ الْعِبَادِ كَانَتِ الْأَعْمَالُ مُعْتَبَرَةً بِذَلِكَ؛ لِأَنَّهُ مَقْصُودُ الشَّارِعِ فِيهَا كَمَا تَبَيَّنَ، فَإِذَا كَانَ الْأَمْرُ فِي ظَاهِرِهِ وَبَاطِنِهِ عَلَى أَصْلِ الْمَشْرُوعِيَّةِ؛ فَلَا إِشْكَالَ، وَإِنْ كَانَ الظَّاهِرُ مُوَافِقًا وَالْمَصْلَحَةُ مُخَالِفَةً؛ فَالْفِعْلُ غَيْرُ صَحِيحٍ وَغَيْرُ مَشْرُوعٍ؛ لِأَنَّ الْأَعْمَالَ الشَّرْعِيَّةَ2 لَيْسَتْ مَقْصُودَةً [لِأَنْفُسِهَا]. وَإِنَّمَا قُصِدَ بِهَا أُمُورٌ أُخَرُ هِيَ مَعَانِيهَا، وَهِيَ الْمَصَالِحُ الَّتِي شُرِعَتْ لِأَجْلِهَا؛ فَالَّذِي عَمِلَ مِنْ ذَلِكَ عَلَى غَيْرِ هَذَا الْوُضْعِ؛ فَلَيْسَ عَلَى وَضْعِ الْمَشْرُوعَاتِ....",
          "وَعَلَى هَذَا نَقُولُ فِي الزَّكَاةِ مَثَلًا: إِنَّ الْمَقْصُودَ بِمَشْرُوعِيَّتِهَا رَفْعُ رَذِيلَةِ الشُّحِّ وَمَصْلَحَةُ إِرْفَاقِ الْمَسَاكِينِ، وَإِحْيَاءُ النُّفُوسِ الْمُعَرَّضَةِ لِلتَّلَفِ."
        ]
      }
    ],
    "slug": "masalah-1-nisab-zakat-mal",
    "judulSingkat": "Dilema Standar Nisab Zakat Mal",
    "judul": "Dilema Standar Nisab Zakat Mal: Reorientasi Ukuran Emas-Perak dalam Mewujudkan Maqashid asy-Syari'ah dan Ta'awun Ijtima'i",
    "pdf": "https://drive.google.com/uc?export=download&id=1f9jHP1W9yGhFJ3ygk0upXwKzrYG4VVIL",
    "spoiler": "Tidak wajib. Mayoritas ulama kontemporer lebih condong kepada nisab terendah (adna an-nishabayn), karena jika nisab emas yang dipakai, persentase orang berzakat akan sangat rendah.",
    "nomor": 1
  },
  {
    "deskripsi": [
      "Di berbagai daerah pesisir, berkembang praktik jual beli hasil laut (seafood) dengan sistem yang berbeda dari jual beli pada umumnya. Dalam praktik ini, penjual menyediakan sebuah kolam atau wadah yang berisi berbagai jenis seafood hidup, seperti udang, kepiting, kerang, atau lobster. Pembeli tidak membeli berdasarkan timbangan atau jumlah yang telah ditentukan oleh penjual, melainkan diberi kesempatan untuk mengambil sendiri hasil laut tersebut dalam waktu atau kesempatan tertentu dengan menggunakan alat yang telah disediakan. Seperti seorang pembeli harus membayar dengan nominal tertentu kemudian diberikan kesempatan satu kali untuk menyerok seafood dalam wadah besar sebanyak satu kali, atau diberi kesempatan selama 10 detik untuk meraup sebanyak-banyaknya.",
      "Harga yang dibayarkan telah ditentukan di awal secara tetap, tanpa memperhitungkan jumlah atau berat seafood yang berhasil diperoleh. Akibatnya, hasil yang didapat setiap pembeli berbeda-beda. Pembeli yang memiliki keterampilan, pengalaman, atau keberuntungan dapat memperoleh hasil yang banyak. Sehingga nilai barang yang diperoleh jauh melebihi harga yang dibayarkan. Sebaliknya, pembeli yang kurang terampil atau kurang beruntung hanya memperoleh sedikit hasil. Bahkan nilainya dapat berada di bawah harga pasar, jika dibandingkan dengan pembelian seafood secara biasa, berdasarkan berat atau satuan.",
      "Di satu sisi, praktik tersebut dipandang sebagai bentuk hiburan yang memberikan sensasi tersendiri bagi konsumen. Akan tetapi, di sisi lain muncul pertanyaan mengenai kejelasan objek akad (ma'qud 'alaih). Keseimbangan nilai tukar, serta kemungkinan jumlah barang yang diperoleh tidak diketahui secara pasti saat akad dilakukan.",
      "Berdasarkan fenomena tersebut, diperlukan kajian hukum Islam untuk menilai status akad jual beli tersebut; apakah termasuk jual beli yang sah, karena adanya kerelaan kedua belah pihak ('an taradhin)ataukah tidak sah."
    ],
    "soal": [
      {
        "tanya": [
          "Bagaimana hukum jual beli seafood dengan sistem pembeli mengambil sendiri hasil laut yang diperoleh, sedangkan harga telah ditentukan di awal tanpa memperhatikan jumlah hasil yang didapat?"
        ],
        "jawab": [
          "Tidak diperbolehkan jika menggunakan akad yang di atas, dikarenakan ada unsur gharar (tidak jelas/samar-samar)."
        ],
        "referensi": [
          "قال الإمام مسلم في صحيحه، كتاب البيوع، باب بطلانِ بيعِ الْحَصَاةِ، وَالْبَيعِ الَّذِي فِيهِ غرر، رقم الحديث 1513:",
          "وَحَدَّثَنَا أَبُو بَكْرِ بْنُ أَبِي شَيْبَةَ، حَدَّثَنَا عَبْدُ اللَّهِ بْنُ إِدْرِيسَ، وَيَحْيَى بْنُ سَعِيدٍ، وَأَبُو أُسَامَةَ عَنْ عُبَيْدِ اللَّهِ، ح وَحَدَّثَنِي زُهَيْرُ بْنُ حَرْبٍ، - وَاللَّفْظُ لَهُ - حَدَّثَنَا يَحْيَى بْنُ سَعِيدٍ، عَنْ عُبَيْدِ اللَّهِ، حَدَّثَنِي أَبُو الزِّنَادِ، عَنِ الْأَعْرَجِ، عَنْ أَبِي هُرَيْرَةَ، قَالَ نَهَى رَسُولُ اللَّهِ صلى الله عليه وسلم عَنْ بَيْعِ الْحَصَاةِ وَعَنْ بَيْعِ الْغَرَرِ.",
          "قال الخطيب الشربيني رحمه الله في الإقناع في حل ألفاظ أبي شجاع، ج. 2، ص. 8-9، طبعة دار الكتب العلمية بيروت، 2004:",
          "والشرط الخامس العلم به للعاقدين عينا وقدرا وصفة، على ما يأتي بيانه حذرا من الغرر، لما روى مسلم أنه ﷺ نهى عن بيع الغرر.",
          "قال أبو إسحاق الشيرازي رحمه الله في المهذب في فقه الإمام الشافعي، ج. 2، ص. 33-34، طبعة دار القلم دمشق، 1996:",
          "ولا يجوز بيع ما لا يقدر على تسليمه كالطير في الهواء أو السمك في الماء والجمل الشارد والفرس العائر والعبد الآبق والمال المغصوب في يد الغاصب، لحديث أبي هريرة رضي الله عنه أن النبي ﷺ نهى عن بيع الغرر. وهذا غرر. ولهذا قال ابن مسعود: لا تشتروا السمك في الماء، فإنه غرر، ولأن القصد بالبيع تمليك التصرف. وذلك لايمكن فيما لايقدر على تسليمه. فإن باع طيرا في برج مغلق الباب أو السمك في بركة لاتتصل بنهر، نظرت: فإن قدر على تناوله إذا أراد من غير تعب، جاز بيعه. وإن كان في برج عظيم أو بركة عظيمة لايقدر على أخذه إلا بتعب، لم يجز بيعه، لأنه غير مقدور عليه في الحال.",
          "قال البابرتي رحمه الله في العناية شرح الهداية، ج. 3، ص. 577، طبعة دار الكتب العلمية بيروت، 2007:",
          "قال (وضربة القانص) القانص الصائد، يقال قنص إذا صاد. وضربة القانص ما يخرج من الصيد بضرب الشبكة. يقال ضرب الشبكة على الطائر ألقاها، ومنه نهى عن ضربه. وفي تهذيب الأزهري عن ضربة الغائص وهو الغواص على اللآلئ وهو أن يقول للتاجر أغوص لك غوصة فما أخرجت فهو لك بكذا، والمعنى فيهما واحد، وهو أنه مجهول وأن فيه غررا، لأنه يجوز أن لا يدخل في الشبكة شيء من الصيد وأن لا يخرج من الغوصة شيئا.",
          "قال الرافعي رحمه الله في العزيز في شرح الوجيز وهو الشرح الكبير، ج. 5، ص. 384-385، طبعة جائزة دبي الدولية للقرآن الكريم الإمارات، 2016:",
          "لا يجوز بيع السمك في الماء والطير في الهواء، وإن كان مملوكا له، لما فيه من الغرر. ولو باع السمك في بركة لا يمكنها الخروج منها، نظر: إن كانت صغيرة يمكن أخذها من غير تعب ومشقة صح بيعها، لحصول القدرة. وإن كانت كبيرة لا يمكن أخذها إلا باحتمال تعب شديد ففيه وجهان أوردهما ابن سريج فيما رأيت له من جوابات جامعه الصغير وغيره، أظهرهما المنع. وبه قال أبو حنيفة كبيع الآبق. ويدل عليه ما روي عن ابن مسعود رضي الله عنه أنه قال: لا تشتروا السمكة في الماء، فانه غرر. وقد نهي النبي ﷺ عن بيع الغرر. وهذاكله فيما إذا لم يمنع الماء رؤية السمك. فإن منع لكدورته فهو على قولي بيع الغائب، إلا أن لا يعلم قلة السمك وكثرتها وشيئا من صفاتها، فيبطل لا محالة."
        ]
      },
      {
        "tanya": [
          "Bagaimana solusi atau bentuk akad yang sesuai dengan prinsip syariah agar praktik tersebut dapat dilakukan tanpa menimbulkan unsur yang dilarang?"
        ],
        "jawab": [
          "Akad yang dapat dijadikan sebagai solusi adalah akad ijarah (sewa), yakni dengan menyewa wahana dan alat yang digunakan menangkap/menjaring. Sedangkan hasil tangkapannya dianggap sebagai hibah (pemberian cuma-cuma)."
        ],
        "referensi": [
          "قال ابن حجر الهيتمي رحمه الله في تحفة المحتاج بشرح المنهاج، ج. 6، ص. 245، طبعة دار الضياء الكويت:",
          "نعم، يجوز دخول الحمام بأجرة إجماعا، مع الجهل بقدر المكث وغيره، لكن الأجرة في مقابلة الآلات لا الماء، فعليه ما يسكب به الماء غير مضمون على الداخل، وثيابه غير مضمونة على الحمامي ما لم يستحفظه عليها ويجبه لذلك ولو بالإشارة برأسه، كما يعلم مما يأتي في (الوديعة). ولا يجب بيان ما يستأجر له في الدار لقرب التفاوت بين السكنى ووضع المتاع ومن ثم حمل العقد على المعهود في مثلها من سكانها ولم تشترط معرفة عدد من يسكن اكتفاء بما اعتيد في مثلها. (ثم) إذا وجدت الشروط في المنفعة (تارة تقدر) المنفعة (بزمان) فقط. وضابطه: كل ما لا ينضبط بالعمل. وحينئذ يشترط علمه كرضاع هذا شهرا وتطيين أو تجصيص أَوْ اكْتِحَالٍ أَوْ مُدَاوَاةِ هَذَا يَوْمًا.",
          "قال البهوتي الحنبلي رحمه الله في كشاف القناع عن الإقناع، ج. 9، ص. 67، طبعة وزارة العدل في المملكة العربية السعودية، 2006:",
          "(قَالَ ابْنُ عَقِيلٍ يَجُوزُ اسْتِئْجَارُ الْبِئْرِ لِيَسْتَقِيَ مِنْهُ أَيَّامًا مَعْلُومَةً، أَوْ) يَسْتَقِيَ مِنْهَا (دِلَاءً مَعْلُومَةً؛ لِأَنَّ هَوَاءَ الْبِئْرِ وَعُمْقَهَا فِيهِ نَوْعُ انْتِفَاعٍ بِمُرُورِ الدَّلْوِ فِيهِ، فَأَمَّا الْمَاءُ فَيُؤْخَذُ عَلَى الْإِبَاحَةِ. انْتَهَى)، لِأَنَّهُ إِنَّمَا يُمْلَكُ بِالْحِيَازَةِ كَمَا تَقَدَّمَ. قَالَ فِي الْمُغْنِي: وَهَذَا التَّعْلِيلُ يَقْتَضِي أَنَّهُ يَجُوزُ أَنْ يَسْتَأْجِرَ مِنْهُ بِرْكَتَهُ لِيَصْطَادَ مِنْهَا السَّمَكَ مُدَّةً مَعْلُومَةً. انْتَهَى. وَهُوَ وَاضِحٌ إِذَا لَمْ تُعْمَلْ لِلسَّمَكِ، لِأَنَّ هَوَاءَ الْبِرْكَةِ وَعُمْقَهَا فِيهِ نَوْعُ انْتِفَاعٍ بِمُرُورِ آلَةِ الصَّيْدِ، وَالسَّمَكُ يُؤْخَذُ عَلَى الْإِبَاحَةِ. وَأَمَّا إِذَا عُمِلَتْ لِلسَّمَكِ فَإِنَّهُ يُمْلَكُ بِحُصُولِهِ فِيهَا كَمَا يَأْتِي فِي الصَّيْدِ، فَلَا تَصِحُّ الْإِجَارَةُ لِأَخْذِهِ. لَكِنْ إِنْ أَجَّرَهَا قَبْلَ حُصُولِ السَّمَكِ بِهَا لِمَنْ يَصْطَادُهُ مِنْهَا مُدَّةً مَعْلُومَةً، صَحَّ. فَإِذَا حَصَلَ فِيهَا فَلَهُ صَيْدُهُ."
        ]
      }
    ],
    "slug": "masalah-2-jual-beli-seafood",
    "judulSingkat": "Hukum Jual Beli Seafood Sistem Ambil Sendiri dengan Harga Tetap",
    "judul": "Hukum Jual Beli Seafood Sistem Ambil Sendiri dengan Harga Tetap",
    "headline": "Untung Apa Buntung?",
    "pdf": "https://drive.google.com/uc?export=download&id=1kOEPEUI2-P8WG2aFuqNjUqGt3pjsEVQl",
    "spoiler": "Tidak diperbolehkan jika menggunakan akad tersebut, dikarenakan ada unsur gharar (tidak jelas atau samar-samar).",
    "nomor": 2
  },
  {
    "deskripsi": [
      "Di suatu daerah telah lama penyelenggaraan shalat Jumat yang diikuti oleh seluruh",
      "penduduk laki-laki yang memenuhi syarat wajib dan sahnya shalat Jumat. Jumlah mereka sekitar tujuh puluh orang, sehingga pelaksanaan Jumat berjalan sebagaimana mestinya tanpa menimbulkan persoalan.",
      "Beberapa waktu kemudian, pemerintah menetapkan pemekaran wilayah, sehingga daerah tersebut terbagi menjadi dua wilayah administratif yang berdiri sendiri. Akibat pemekaran tersebut, jumlah penduduk laki-laki yang memenuhi syarat penyempurna pelaksanaan shalat Jumat di masing-masing wilayah menjadi kurang dari empat puluh orang.",
      "Secara geografis, kedua wilayah tersebut masih saling berdekatan dan pada awalnya merupakan satu kesatuan permukiman. Tidak ada perubahan selain perubahan batas administrasi.",
      "Perubahan tersebut menimbulkan kebingungan di tengah masyarakat mengenai tata cara pelaksanaan shalat Jumat. Jika masing-masing wilayah menyelenggarakan shalat Jumat sendiri, maka jumlah jamaahnya tidak memenuhi ketentuan yang disyaratkan. Sementara itu, apabila pelaksanaan Jumat tetap digabung sebagaimana sebelumnya, maka muncul keraguan apakah hal tersebut masih dibenarkan setelah adanya pemekaran wilayah."
    ],
    "soal": [
      {
        "tanya": [
          "1 Apakah pemekaran wilayah administratif berdampak pada hukum pelaksanaan shalat Jumat, apakah tetap satu atau harus dipisah menurut fikih?"
        ],
        "jawab": [
          "Ya, dapat berpengaruh jika wilayah tersebut memenuhi dua syarat:",
          "1. berbeda nama",
          "2. mustaqillah 'urf (berdiri sendiri secara adat dan realita masyarakat)"
        ],
        "referensi": [
          "قال المليباري رحمه الله في فتح المعين بشرح قرة العين بمهمات الدين، ص. 220-221، طبعة دار الفيحاء دمشق، 2022:",
          "قال ابن الرفعة وغيره: إنهم إذا سمعوا النداء من مصر فهم مخيرون بين أن يحضروا البلد للجمعة وبين أن يقيموها في قريتهم. وإذا حضروا البلد لا يكمل بهم العدد، لأنهم في حكم المسافرين. وإذا لم يكن في القرية جمع تنعقد بهم الجمعة - ولو بامتناع بعضهم منها - يلزمهم السعي إلى بلد يسمعون من جانبه النداء.",
          "قال ابن عجيل: ولو تعددت مواضع متقاربة وتميز كل باسم فلكل حكمه. قال شيخنا: إنما يتجه ذلك إن عد كل مع ذلك قرية مستقلة عرفا.",
          "قال السيد البكري رحمه الله في إعانة الطالبين على حل ألفاظ فتح المعين، ج 2. ص. 843-844، طبعة دار السلام:",
          "قوله: (وتميز كل باسم) أي بأن يكون لكل موضع اسم مخصوص.",
          "قوله: (فلكل حكمه) أي فلكل موضع من هذه المواضع حكم مختص به، فإن كان كل موضع مشتملا على أربعين كاملين لزمتهم الجمعة، وإلا فلا تلزمهم، وإن كان لو اجتمعوا كلهم في موضع واحد يبلغون أربعين، وإن سمع أهل كل موضع نداء الآخر.",
          "قوله: (قال شيخنا) أي في التحفة.",
          "قوله: (إنما يتجه ذلك) أي كون كل موضع له حكم مستقل.",
          "قوله: (إن عد كل مع ذلك) أي مع تميز كل باسم قرية مستقلة، فإن لم يعد كل مع ذلك قرية مستقلة كالمواضع المتعددة بمكة المسماة بالحواير، فإن كل موضع له اسم مخصوص كالشبيكة والشامية، فليس لكل حكم مخصوص، بل الكل حكمه حكم موضع واحد.",
          "وعبارة فتاوى ابن حجر:",
          "(سئل) رحمه الله تعالى عن بلد تسمى راون بها ثلاث قرى مفصولة مختصة، كل قرية باسم وصيفة بين كل قرية أقل من خمسين ذراعا، فبنوا مسجد لإقامة الجمعة في خطة أبنية أوطان المجمعين، فصلوا فيه مدة طويلة، فحصل بينهم مقاتلة، فانفردت قرية من الثلاثة بجمعة، وأهل القريتين بنوا مسجدا ثانيا بجمعة أخرى.",
          "فهل يلزمهم أن يجتمعوا بجمعة واحدة وتبطل الأخرى بوجود الأمان بينهم أو لا؟ (فأجاب) -نفع الله به- : حيث كانت القرى المذكورة يتمايز بعضها عن بعض، وكان في كل قرية أربعون من أهل الجمعة، خرجوا عن عهدة الواجب، وصحت جمعتهم، سواء المتقدمة والمتأخرة الخ.",
          "قال السيد باعلوي رحمه الله في بغية المسترشدين، ج ١، ص. 559، طبعة دار المنهاج جدة، 2018:",
          "المراد بالخطة : محل معدود من البلد أو القرية ؛ بأن لم يجز للمسافر القصر فيه.",
          "ولو تعددت مواضع وتميز كل باسم فلكل حكمه إن عُدَّ كل قرية مُستقلة عرفاً، بحيث لو خرج المسافر من أحدهما إلى جهة الأخرى عد مسافراً عرفا، بأن فصل بينهما فاصل ولو بنحو ذراعين إن عده العرف فاصلا، كالمقابر وملعب الصبيان ومطرح الرماد والمناخ والنادي ومورد الماء والمزارع، أو لم يفصل ما ذُكر، لكن لم يتصل دورها الاتصال الغالب في دور البلدان. ولهذا لو تفرقت الأبنية بحيث لم تعد مجتمعة في العرف لم تصح إقامة الجمعة بها."
        ]
      },
      {
        "tanya": [
          "Bolehkah penduduk kedua wilayah bergabung untuk menyelenggarakan satu shalat Jumat?"
        ],
        "jawab": [
          "Tidak boleh.",
          "Dalam kasus ini, penduduk kedua wilayah tidak boleh bergabung untuk menyelenggarakan satu shalat Jumat.",
          "Bila jamaah masjid yang jumlahnya kurang dari 40 orang, maka diperbolehkan bergabung dengan masjid lain untuk melaksanakan shalat Jumat."
        ],
        "referensi": [
          "قال النووي رحمه الله في روضة الطالبين وعمدة المفتين، ج. 2، ص. 37، طبعة المكتب الإسلامي بيروت، 1991:",
          "الْقَرْيَةُ إِذَا كَانَ فِيهَا أَرْبَعُونَ مِنْ أَهْلِ الْكَمَالِ، لَزِمَهُمُ الْجُمُعَةُ. فَإِنْ أَقَامُوهَا فِي قَرْيَتِهِمْ، فَذَاكَ. وَإِنْ دَخَلُوا الْمِصْرَ فَصَلَّوْهَا فِيهِ، سَقَطَ الْفَرْضُ عَنْهُمْ، وَكَانُوا مُسِيئِينَ، لِتَعْطِيلِهِمُ الْجُمُعَةَ فِي قَرْيَتِهِمْ. وَفِيهِ وَجْهٌ: أَنَّهُمْ غَيْرُ مُسِيئِينَ، لِأَنَّ أَبَا حَنِيفَةَ لَا يُجَوِّزُ جُمُعَةً فِي قَرْيَةٍ، فَفِيمَا فَعَلُوهُ، خُرُوجٌ مِنَ الْخِلَافِ، وَهُوَ ضَعِيفٌ.",
          "قال السيد البكري رحمه الله في إعانة الطالبين على حل ألفاظ فتح المعين، ج. 2، ص. 843-844، طبعة دار السلام:",
          "قوله: (وتميز كل باسم) أي بأن يكون لكل موضع اسم مخصوص.",
          "قوله: (فلكل حكمه) أي فلكل موضع من هذه المواضع حكم مختص به، فإن كان كل موضع مشتملا على أربعين كاملين لزمتهم الجمعة، وإلا فلا تلزمهم، وإن كان لو اجتمعوا كلهم في موضع واحد يبلغون أربعين، وإن سمع أهل كل موضع نداء الآخر.",
          "قوله: (قال شيخنا) أي في التحفة.",
          "قوله: (إنما يتجه ذلك) أي كون كل موضع له حكم مستقل.",
          "قوله: (إن عد كل مع ذلك) أي مع تميز كل باسم قرية مستقلة، فإن لم يعد كل مع ذلك قرية مستقلة كالمواضع المتعددة بمكة المسماة بالحواير، فإن كل موضع له اسم مخصوص كالشبيكة والشامية، فليس لكل حكم مخصوص، بل الكل حكمه حكم موضع واحد.",
          "وعبارة فتاوى ابن حجر:",
          "(سئل) رحمه الله تعالى عن بلد تسمى راون بها ثلاث قرى مفصولة مختصة، كل قرية باسم وصيفة بين كل قرية أقل من خمسين ذراعا، فبنوا مسجد لإقامة الجمعة في خطة أبنية أوطان المجمعين، فصلوا فيه مدة طويلة، فحصل بينهم مقاتلة، فانفردت قرية من الثلاثة بجمعة، وأهل القريتين بنوا مسجدا ثانيا بجمعة أخرى.",
          "فهل يلزمهم أن يجتمعوا بجمعة واحدة وتبطل الأخرى بوجود الأمان بينهم أو لا؟ (فأجاب) -نفع الله به- : حيث كانت القرى المذكورة يتمايز بعضها عن بعض، وكان في كل قرية أربعون من أهل الجمعة، خرجوا عن عهدة الواجب، وصحت جمعتهم، سواء المتقدمة والمتأخرة الخ.",
          "قال الشيخ نووي البنتني رحمه الله في كاشفة السجا شرح سفينة النجا، ص. 368-369، طبعة دار ابن حزم، 2011:",
          "قَوْلُهُ: (فِي خِطَّةِ الْبَلَدِ)، بِكَسْرِ الْخَاءِ، أَيْ: عَلَامَاتِ أَبْنِيَةِ الْبَلَدِ، وَمِثْلُ الْبِنَاءِ السَّرَبُ -وَهُوَ بِفَتْحَتَيْنِ- فِي الْأَرْضِ، وَالْكَهْفُ -أَيِّ الْغَارُ- فِي الْبَلَدِ، فَيَلْزَمُ أَهْلَهُمَا الْجُمُعَةُ وَإِنْ خَلَتَا عَنِ الْأَبْنِيَةِ. وَيَشْتَرِطُ اجْتِمَاعَ الْأَبْنِيَةِ عُرْفًا، وَأَنْ لَا يَزِيدَ مَا بَيْنَ الْمَنْزِلَيْنِ عَلَى ثَلَاثِ مِئَةِ ذِرَاعٍ دَاخِلَهَا أَوْ خَارِجَهَا فِي مَحَلٍّ لَا تُقْصَرُ فِيهِ الصَّلَاةُ إِلَّا بَعْدَ مُجَاوَزَتِهِمْ مَا تَقَدَّمَ فِي الْمُسَافِرِ. نَقَلَهُ الشَّرْقَاوِيُّ عَنِ الرَّحْمَانِيِّ."
        ]
      },
      {
        "tanya": [
          "Apabila penggabungan tidak diperbolehkan, apakah penduduk masing-masing wilayah wajib mendatangi tempat lain yang memenuhi syarat pelaksanaan shalat Jumat, ataukah kewajiban Jumat gugur dari mereka sehingga diganti dengan shalat Zuhur?"
        ],
        "jawab": [
          "Tidak wajib, kecuali bila mendengar panggilan azan dari masjid lain, dan sebaiknya memilih masjid yang terbanyak jamaahnya."
        ],
        "referensi": [
          "قال البغوي رحمه الله في التهذيب في الفقه الشافعي، ج. 2، ص. 333، طبعة دار الكتب العلمية، 1997:",
          "والناس في الجمعة على أربعة أقسام:",
          "قسم يجب عليهم حضور الجمعة، ويكمل بهم العدد، وهم الأحرار العاقلون البالغون الذكور المستوطنون الذين لا عذر لهم، ولو لم يحضروا عصوا.",
          "وقسم لا يجب عليهم حضورها، ولو حضروها وصلوا الجمعة، سقط الفرض عنهم، ولكن لا يكمل بهم العدد، وهم العبيد والنسوان والصبيان والمسافرون. والخنثى المشكل كالمرأة. ومن بعضه حر كالعبد.",
          "وقسم يجب عليهم حضورها، ولا يكمل بهم العدد، وهم غير المستوطنين، مثل المسافر الذي نوى إقامة أربع وأهل الخيام الذي يبلغهم نداء أهل البلد وأهل القرى الذين انتقصوا عن الأربعين، ويبلغهم نداء البلد.",
          "فأما الغريب الذي طال مقامه في بلد، وفي عزمه الرجوع إلى بلده كالمتفقه والبحار، عليهم حضور الجمعة، وهل يكمل بهم العدد؟ فيه وجهان: قال ابن أبي هريرة: يكمل بهم العدد، لأنهم مقيمون. والثاني: -وهو الأصح قاله أبو إسحاق- لا يكمل بهم، لأنهم غير متوطنين.",
          "قال النووي رحمه الله في روضة الطالبين وعمدة المفتين، ج. 2، ص. 37، طبعة المكتب الإسلامي بيروت، 1991:",
          "وَإِنْ لَمْ يَكُنْ فِيهَا أَرْبَعُونَ مِنْ أَهْلِ الْكَمَالِ، فَلَهُمْ حَالَانِ. أَحَدُهُمَا: يَبْلُغُهُمُ النِّدَاءُ مِنْ مَوْضِعٍ تُقَامُ فِيهِ جُمُعَةٌ مِنْ بَلَدٍ، أَوْ قَرْيَةٍ، فَتَجِبُ عَلَيْهِمُ الْجُمُعَةُ. وَالْمُعْتَبَرُ نِدَاءُ مُؤَذِّنٍ عَالِي الصَّوْتِ يَقِفُ عَلَى طَرَفِ الْبَلَدِ مِنَ الْجَانِبِ الَّذِي يَلِي تِلْكَ الْقَرْيَةَ، وَيُؤَذِّنُ عَلَى عَادَتِهِ، وَالْأَصْوَاتُ هَادِئَةٌ، وَالرِّيَاحُ رَاكِدَةٌ. فَإِذَا سَمِعَ صَوْتَهُ مِنَ الْقَرْيَةِ مَنْ أَصْغَى إِلَيْهِ، وَلَمْ يَكُنْ أَصَمَّ، وَلَا جَاوَزَ سَمْعُهُ حَدَّ الْعَادَةِ، وَجَبَتِ الْجُمُعَةُ عَلَى أَهْلِهَا.",
          "وَفِي وَجْهٍ: الْمُعْتَبَرُ أَنْ يَقِفَ الْمُؤَذِّنُ فِي وَسَطِ الْبَلَدِ، وَوَجْهٌ يَقِفُ فِي الْمَوْضِعِ الَّذِي تُقَامُ فِيهِ الْجُمُعَةُ. وَهَلْ يُعْتَبَرُ أَنْ يَقِفَ عَلَى مَوْضِعٍ عَالٍ كَمَنَارَةٍ أَوْ سُورٍ؟ وَجْهَانِ. قَالَ الْأَكْثَرُونَ: لَا يُعْتَبَرُ.",
          "قال الشيخ نووي البنتني رحمه الله في كاشفة السجا شرح سفينة النجا، ص. 368-369، طبعة دار ابن حزم، 2011:",
          "فرع: قال الشيخ محمد الرئيس في فتواه: إن كانت القرى متباعدة وجب على كل قرية جمعة إن جمعت الشروط. وضابط البعد عدم اتحاد المرافق، كملعب الصبيان والنادي -وهو محل القوم ومتحدثهم-، ومطرح الرماد، والاستعارة من بعضهم بعضا. فإن اختلفت فقرى أو فهي قرى كثيرة. وإن اتحدت فالمتجه فيما ذكر قرية واحدة. والتي لم تجمع الشروط مع عدم الاتحاد، فهي مع غيرها كخارج البلدة، فإن سمعت النداء وجب عليها الحضور. وإلا فلا.",
          "قال النووي رحمه الله في روضة الطالبين وعمدة المفتين، ج. 2، ص. 38، طبعة المكتب الإسلامي بيروت، 1991:",
          "وَإِذَا سَمِعَ أَهْلُ الْقَرْيَةِ النَّاقِصُونَ عَنِ الْأَرْبَعِينَ النِّدَاءَ مِنْ بِلَادِينِ، فَأَيُّهُمَا حَضَرُوا جَازَ، وَالْأَوْلَى حُضُورُ أَكْثَرِهِمَا جَمَاعَةً."
        ]
      }
    ],
    "slug": "masalah-3-ittihad-al-baldah",
    "judulSingkat": "Pengaruh Pemekaran Wilayah terhadap Ittihad al-Baldah dalam Shalat Jumat",
    "judul": "Pengaruh Pemekaran Wilayah terhadap Ittihad al-Baldah dalam Pelaksanaan Shalat Jumat",
    "pdf": "https://drive.google.com/uc?export=download&id=1dQAVEI2brW31ZkjAdG8QiuQBoFEhvxsq",
    "spoiler": "Ya, dapat berpengaruh, jika wilayah tersebut memenuhi dua syarat: berbeda nama, dan mustaqillah 'urf (berdiri sendiri secara adat dan realita masyarakat).",
    "nomor": 3
  },
  {
    "deskripsi": [
      "Perkembangan teknologi informasi dan media sosial telah mengubah cara masyarakat memperoleh, memproduksi, dan menyebarkan informasi. Hampir setiap orang dapat merekam suatu peristiwa dan menyebarkannya kepada khalayak luas hanya dalam hitungan detik.",
      "Kondisi ini melahirkan fenomena baru berupa maraknya penyebaran foto atau video yang menampilkan kesalahan, pelanggaran, dugaan tindak pidana, maupun perilaku yang dianggap menyimpang dari norma agama atau norma sosial.",
      "Penyebaran konten tersebut umumnya dilakukan dengan berbagai alasan, seperti:",
      "memberikan edukasi kepada masyarakat, mencegah terulangnya suatu perbuatan, memperingatkan masyarakat agar lebih waspada, membantu penegakan hukum, atau sebagai bentuk amar ma'ruf nahi munkar. Namun, tidak sedikit pula yang dilakukan demi memperoleh perhatian publik, meningkatkan jumlah pengikut, atau mendapatkan keuntungan ekonomi melalui media sosial.",
      "Di sisi lain, penyebaran konten yang memuat identitas atau aib seseorang berpotensi menimbulkan berbagai dampak negatif, seperti terbukanya aib, ghibah, pencemaran nama baik, pelanggaran privasi, perundungan digital, hingga hukuman sosial yang dapat terus melekat, meskipun pelaku telah bertobat atau menjalani proses hukum. Bahkan, dalam beberapa kasus, informasi yang beredar belum tentu utuh atau telah keluar dari konteks, sehingga dapat menimbulkan kesalahpahaman dan ketidakadilan. Meskipun demikian, tidak dapat dipungkiri bahwa pada kondisi tertentu penyebaran suatu informasi dapat menghadirkan kemaslahatan yang nyata, seperti mencegah bahaya yang lebih besar, membantu pengungkapan tindak kejahatan, atau melindungi masyarakat dari potensi kerugian.",
      "Berdasarkan kondisi tersebut, muncul persoalan mengenai bagaimana hukum penyebaran konten digital yang membuka aib seseorang menurut perspektif fikih Islam, serta bagaimana batasan-batasan syariat yang dapat dijadikan pedoman untuk membedakan antara penyebaran yang dibenarkan demi kemaslahatan umum dengan penyebaran yang tergolong ghibah, tasyhir (mempermalukan), atau pelanggaran terhadap kehormatan dan hak privasi seseorang."
    ],
    "soal": [
      {
        "tanya": [
          "Bagaimana hukum merekam dan menyebarkan foto atau video yang menampilkan kesalahan, pelanggaran, atau aib seseorang melalui media sosial?"
        ],
        "jawab": [
          "Dalam konteks ini ada dua aspek yang perlu diperhatikan: perekaman dan penyebaran.",
          "a. Perekaman: Pada dasarnya diperbolehkan, dengan cara yang ma'ruf. Baik dilakukan dengan izin maupun tanpa izin. Meskipun terdapat dalil yang mewajibkan meminta izin dari orang yang direkam, namun mengingat realitas saat ini dimana meminta izin dianggap sulit, maka hal tersebut tidak lagi menjadi patokan utama dalam perekaman.",
          "b. Penyebaran: Hukum haram atau bolehnya tergantung pada tingkat kemafsadatan (kerusakan) yang ditimbulkan dan kemaslahatan yang dihasilkan."
        ],
        "referensi": [
          "قال الله تعالى في القرآن الكريم، سورة النساء، الآية 148:",
          "لَا يُحِبُّ اللَّهُ الْجَهْرَ بِالسُّوءِ مِنَ الْقَوْلِ إِلَّا مَنْ ظُلِمَ وَكَانَ اللَّهُ سَمِيعًا عَلِيمًا.",
          "قال الطبري رحمه الله في جامع البيان عن تأويل آي القرآن، ج. 7، ص. 631-632، طبعة دار هجر جيزة، 2001:",
          "فالصواب في تاويل ذلك: لا يحب الله أيها الناس أن يجهر أحد لأحد بالسوء من القول إلا من ظلم، بمعنى: إلا من ظلم فلا حرج عليه أن يخبر بما أسيئ إليه. وإذا كان ذلك معناه دخل فيه إخبار من لم يقر أو أسيء قراه أو نيل بظلم في نفسه أو ماله عنوة من سائر الناس. وكذلك دعاؤه على من ناله بظلم أن ينصره الله عليه، لأن في دعائه عليه إعلاما منه لمن سمع دعاءه عليه بالسوء له.",
          "قال الله تعالى في القرآن الكريم، سورة النور، الآية 19:",
          "إِنَّ الَّذِينَ يُحِبُّونَ أَنْ تَشِيعَ الْفَاحِشَةُ فِي الَّذِينَ آمَنُوا لَهُمْ عَذَابٌ أَلِيمٌ فِي الدُّنْيَا وَالْآخِرَةِ وَاللَّهُ يَعْلَمُ وَأَنْتُمْ لَا تَعْلَمُونَ.",
          "قال الإمام البخاري رحمه الله في صحيحه، كِتَاب المَظَالِمِ وَالغَصْبِ، باب لا يظلم المسلم المسلم ولا يسلمه، رقم الحديث 2442:",
          "حَدَّثَنَا يَحْيَى بْنُ بُكَيْرٍ حَدَّثَنَا اللَّيْثُ عَنْ عُقَيْلٍ عَنِ ابْنِ شِهَابٍ أَنَّ سَالِمًا أَخْبَرَهُ أَنَّ عَبْدَ اللَّهِ بْنَ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا أَخْبَرَهُ أَنَّ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «المُسْلِمُ أَخُو المُسْلِمِ، لَا يَظْلِمُهُ وَلَا يُسْلِمُهُ. وَمَنْ كَانَ فِي حَاجَةِ أَخِيهِ كَانَ اللَّهُ فِي حَاجَتِهِ. وَمَنْ فَرَّجَ عَنْ مُسْلِمٍ كُرْبَةً فَرَّجَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرُبَاتِ يَوْمِ الْقِيَامَةِ. وَمَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ يَوْمَ الْقِيَامَةِ».",
          "قال النووي رحمه الله في الأذكار من كلام سيد الأبرار، ص. 548-549، طبعة دار المنهاج جدة، 2005:",
          "اعلم أنَّ الغيبةَ وإن كانت محرّمة فإنها تُباح في أحوال للمصلحة، والمُجوِّزُ لها غرض صحيح شرعي لا يمكن الوصولُ إليه إلا بها، وهو أحد ستة أسباب: الأوّل: التظلم، فيجوز للمظلوم أن يتظلَّم إلى السلطان والقاضي وغيرهما ممّن له ولاية أو له قدرة على إنصافه من ظالمه فيذكُرُ أن فلانًا ظلمني وفعل بي كذا وأخذ لي كذا، ونحو ذلك. الثاني: الاستعانة على تغيير المنكر وردّ العاصي إلى الصواب، فيقول لمن يرجو قدرته على إزالة المنكر: فلان يعملُ كذا فازجره عنه ونحو ذلك، ويكون مقصوده التوسل إلى إزالة المنكر، فإن لم يقصد ذلك كان حرامًا. الثالث: الاستفتاء، بأن يقولَ للمفتي: ظلمني أبي أو أخي أو فلان بكذا، فهل له ذلك أم لا؟ وما طريقي في الخلاص منه وتحصيل حقّي ودفع الظلم عني ونحو ذلك؟ وكذلك قوله: زوجتي تفعلُ معي كذا، أو زوجي يفعلُ كذا ونحو ذلك، فهذا جائز للحاجة، ولكن الأحوط أن يقول: ما تقولُ في رجل كان من أمره كذا، أو في زوج أو زوجة تفعلُ كذا، ونحو ذلك، فإنه يحصل به الغرض من غير تعيين، ومع ذلك التعيين جائز لحديث هند الذي سنذكره إن شاء الله تعالى وقولُها: يا رسول الله! إن أبا سفيانَ رجلٌ شحيح .. الحديث. ولم ينهها رسولُ الله صلى الله عليه وسلم. الرابع: تحذير المسلمين من الشرّ ونصيحتهم، وذلك من وجوه: منها جرح المجروحين من الرواة للحديث والشهود، وذلك جائز بإجماع المسلمين، بل واجب للحاجة. ومنها ما استشارك إنسان في مصاهرته أو مشاركته أو إيداعه أو الإيداع عنده أو معاملته بغير ذلك وجب عليك أن تذكر له ما تعلمه منه على جهة النصيحة، فإن حصل الغرض بمجرّد قولك لا تصلحُ لك معاملتُه أو مصاهرتُه أو لا تفعلُ هذا أو نحو ذلك لم تجز الزيادةُ بذكر المساوئ، وإن لم يحصل الغرض إلا بالتصريح بعينه فاذكره بصريحه. ومنها إذا رأيتَ مَن يشتري عبدًا معروفًا بالسرقة أو الزنا أو الشرب أو غيرها، فعليك أن تبيّن ذلك للمشتري إن لم يكن عالمًا به، ولا يختصّ بذلك، بل كل من علم بالسلعة المبيعة عيبًا وجب عليه بيانه للمشتري إذا لم يعلمه. ومنها إذا رأيت متفقهًا يتردَّدُ إلى مبتدع أو فاسق يأخذ عنه العلم خِفتَ أن يتضرّرَ المتفقّه بذلك، فعليك نصيحته ببيان حاله، ويُشترط أن يقصدَ النصيحةَ، وهذا مما يُغلَّطُ فيه، وقد يَحملُ المُتكلّم بذلك الحسدُ، أو يُلبِّسُ الشيطانُ عليه ذلك، ويُخيّلُ إليه أنه نصيحةٌ وشفقةٌ، فليتفطّنْ لذلك. ومنها أن لا يكون له ولاية لا يقوم بها على وجهها، إما بأن لا يكون صالحًا لها، وإما بأن يكون فاسقًا أو مغفلًا ونحو ذلك، فيجب ذكر ذلك لمن له عليه ولاية عامة ليزيلَه ويُولّي من يَصلُحُ، أو يعلم ذلك منه لتعامله بمقتضاة حاله ولا يغترّ به، وأن يسعى في أن يحثّه على الاستقامة أو يستبدل به. الخامس: أن يكون مُجاهرًا بفسقه أو بدعته كالمجاهر بشرب الخمر، أو مصادرة الناس وأخذ المُكس، وجباية الأموال ظلمًا، وتولّي الأمور الباطلة، فيجوز ذكره بما يُجاهر به ويحرم ذكره بغيره من العيوب إلا أن يكون لجوازه سبب آخر مما ذكرناه. السادس: التعريف، فإذا كان الإنسان معروفًا بلقب كالأعمش والأعرج والأصمّ والأعمى والأحول والأفطس وغيرهم، جاز تعريفه بذلك بنيّة التعريف، ويحرمُ إطلاقُه على جهة النقص، ولو أمكن التعريف بغيره كان أولى.",
          "أحكام الفقهاء في مقررات مؤتمرات نهضة العلماء، ص. 93:",
          "ما حكم تصوير الانسان بالكتابة أو بآلة فتوغرافية بغير إذن المصور؟ إذا لم يرض المصور فحرام لأنه إيذاء، إلا أن يكون التصوير محتاجا حكما."
        ]
      },
      {
        "tanya": [
          "Apakah tujuan amar ma'ruf nahi munkar, edukasi, peringatan kepada masyarakat, atau kemaslahatan umum dapat menjadi alasan yang membenarkan penyebaran konten tersebut?"
        ],
        "jawab": [
          "Ya, bila maslahah yang dihasilkan lebih besar dibanding mafsadah. Namun, jika materi konten dianggap memiliki dampak buruk, maka semua tindakan yang mempengaruhi algoritma penyebaran dihukumi haram, baik kontribusi penyebaran itu signifikan maupun skala kecil."
        ],
        "referensi": [
          "قال عز الدين ابن عبد السلام رحمه الله في القواعد الكبرى الموسوم بقواعد الأحكام في إصلاح الأنام، ج. 1، ص. 136، طبعة دار القلم دمشق:",
          "إذا اجتمعت مصالح ومفاسد فإن أمكن تحصيل المصالح ودرء المفاسد فعلنا ذلك امتثالا لأمر الله تعالى فيهما لقوله سبحانه وتعالى: (فاتقوا الله ما استطعتم)، وإن تعذر الدرء والتحصيل فإن كانت المفسدة أعظم من المصلحة درأنا المفسدة ولا نبالي بفوات المصلحة. قال الله تعالى: (يسألونك عن الخمر والميسر قل فيهما إثم كبير ومنافع للناس وإثمهما أكبر من نفعهما)، حرمهما لأن مفسدتهما أكبر من منفعتهما."
        ]
      },
      {
        "tanya": [
          "Bagaimana batasan (ḍawābiṭ) syariat dalam membedakan antara penyebaran informasi yang dibenarkan karena mengandung kemaslahatan dengan penyebaran yang termasuk ghibah, tasyhir (mempermalukan), tajassus (mencari-cari kesalahan), atau pelanggaran terhadap hak privasi seseorang?"
        ],
        "jawab": [
          "Penyebaran konten harus mempertimbangkan dengan kemaslahaatan (kebutuhan) dan mafsadah (dampak buruk) dari konten tersebut. Oleh karena itu, pengguna sosial media sangat diimbau untuk lebih bijak dalam memilah konten, baik untuk disimpan secara pribadi, diberi like (suka), di-repost (posting ulang), maupun tindakan lain yang dapat memengaruhi penyebaran konten terkait."
        ],
        "referensi": [
          "قال عز الدين ابن عبد السلام رحمه الله في القواعد الكبرى الموسوم بقواعد الأحكام في إصلاح الأنام، ج. 1، ص. 136، طبعة دار القلم دمشق:",
          "إذا اجتمعت مصالح ومفاسد فإن أمكن تحصيل المصالح ودرء المفاسد فعلنا ذلك امتثالا لأمر الله تعالى فيهما لقوله سبحانه وتعالى: (فاتقوا الله ما استطعتم)، وإن تعذر الدرء والتحصيل فإن كانت المفسدة أعظم من المصلحة درأنا المفسدة ولا نبالي بفوات المصلحة. قال الله تعالى: (يسألونك عن الخمر والميسر قل فيهما إثم كبير ومنافع للناس وإثمهما أكبر من نفعهما)، حرمهما لأن مفسدتهما أكبر من منفعتهما."
        ]
      },
      {
        "tanya": [
          "Bagaimana pandangan fikih terhadap hak untuk dilupakan (right to be forgotten) di ruang digital bagi seseorang yang rekam jejak aib masa lalunya masih tersebar. Padahal ia telah bertaubat atau telah menjalani hukuman resminya Dan sejauh mana kewajiban pihak lain atau platform untuk menghapus (take down) konten tersebut?"
        ],
        "jawab": [
          "Tindakan take down (penghapusan) wajib dilakukan oleh pihak yang menyebarkan konten tersebut, baik individu yang terekam, perekam, maupun pengelola platform media.",
          "Kewajibannya tersebut dilaksanakan sesuai dengan kapasitas dan kemampuan masing-masing pihak penyebar."
        ],
        "referensi": [
          "قال السيوطي رحمه الله في الحاوي للفتاوي، ج. 1، ص. 384-385، طبعة دار اللباب تركيا، 2021:",
          "ولو خاف من ذكر ذلك الضرر على نفسه دون غيره، فالظاهر أن ذلك لا يكون عذرا؛ لأن التخلص من عذاب الآخرة بضرر الدنيا مطلوب. وقد أقر جماعة من السلف على أنفسهم بالزنا ليقام الحد عليهم فيطهروا، مع أن ذلك محض حق الله، والستر فيه على أنفسهم أولى، فكيف في حق الآدمي؟ ويحتمل أن يقال: إنه يعذر بذلك ويرجى من فضل الله أن يرضي عنه خصمه إذا علم حسن نيته. ولو لم يرض صاحب الحق في الغيبة والزنا ونحوهما أن يعفو إلا ببذل مال فله بذله سعيا في خلاص ذمته، والغبطة في ذلك له. ثم رأيت الغزالي قال في منهاج العابدين في فضل التوبة من حقوق الآدميين: وأما الحرمة بأن خنته في أهله أو ولده أو نحوه فلا وجه للاستحلال والإظهار؛ فإنه يولد فتنة وغيظا، بل تفزع إلى الله سبحانه ليرضيه عنك ويجعل له خيرا كثيرا في مقابلته. فإن أمنت الفتنة والهيج -وهو نادر- فتستحل منه. ثم قال في آخر كلامه: وجملة الأمر أن ما أمكنك من إرضاء الخصوم عملت، وما لم يمكنك راجعت الله بالتضرع والصدق ليرضيه عنك، فيكون ذلك في مشيئة الله يوم القيامة، والرجاء منه بفضله العظيم وإحسانه العميم أنه إذا علم الصدق من قلب العبد فإنه يرضي خصماءه من جزيل فضله يوم القيامة. انتهى.",
          "قال الملا علي القاري رحمه الله في مرقاة المفاتيح شرح مشكاة المصابيح، ج. ١٠، ص. 361، طبعة دار الكتب العلمية، 2001:",
          "قال ابن حجر: تنبيه لو تاب الداعي للإثم وبقي العمل به فهل ينقطع إثم دلالته بتوبته، لأن التوبة تجب ما قبلها أو لا، لأن شرطها رد الظلامة والإقلاع وما دام العمل بدلالته موجودا فالفعل منسوب إليه، فكأنه لم يرد ولم يقلع؟ كل محتمل، ولم أر في ذلك نقلا، والمنقدح الآن الثاني اهـ. والأظهر الأول وإلا فيلزم أن نقول بعدم صحة توبته، وهذا لم يقل به أحد. ثم رد المظالم مقيد بالممكن، وإقلاع كل شيء بحسبه حتما، وأيضا استمرار ثواب الاتباع مبني على استدامة رضا المتبوع به، فإذا تاب وندم انقطع، كما أن الداعي إلى الهدى إن وقع في الردى -نعوذ بالله منه- انقطع ثواب المتابعة له، وأيضا كان كثير من الكفار دعاة إلى الضلالة، وقبل منهم الإسلام لما أن الإسلام يجب ما قبله، فالتوبة كذلك بل أقوى، فإن التائب من الذنب كمن لا ذنب له. (رواه مسلم)"
        ]
      }
    ],
    "slug": "masalah-4-konten-digital-aib",
    "judulSingkat": "Hukum Penyebaran Konten Digital yang Membuka Aib Seseorang",
    "judul": "Hukum Penyebaran Konten Digital yang Membuka Aib Seseorang atas Dasar Amar Ma'ruf Nahi Mungkar dan Kemaslahatan Umum",
    "pdf": "https://drive.google.com/uc?export=download&id=1p15e3kBh3jCls9fzpkGlzIL_dDFxo3Iz",
    "spoiler": "Ada dua aspek yang perlu diperhatikan: perekaman dan penyebaran. Perekaman pada dasarnya diperbolehkan dengan cara yang ma'ruf. Adapun penyebaran, hukum haram atau bolehnya tergantung pada tingkat kemafsadatan dan kemaslahatan.",
    "nomor": 4
  }
];
