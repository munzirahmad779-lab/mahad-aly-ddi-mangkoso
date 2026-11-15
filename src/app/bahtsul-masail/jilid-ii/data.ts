// Data ketetapan Bahtsul Masa'il Jilid II, ditranskripsikan dari dokumen
// resmi SK Ketua Panitia Bahtsul Masa'il Nomor 276/SK/Pan-BM/III/1448.
// Teks Arab ibarah rujukan tidak ditranskripsikan (ekstraksi PDF merusak
// susunan huruf Arabnya); teks lengkap beserta ibarahnya ada di PDF resmi
// yang tertaut pada tiap halaman mas'alah.

export interface SoalJawab {
  tanya: string[];
  jawab: string[];
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
        ]
      },
      {
        "tanya": [
          "Jika memakai emas, standar mana yang muktabar secara fikih: emas murni 24 karat atau emas 14 karat?"
        ],
        "jawab": [
          "Bila kadar kemurnian zakat diikutkan kepada zaman Nabi shallahu alaihi wasallam, maka tentu tak ada yang sesuai, baik 24 karat, apatah lagi 14 karat. Namun kadar yang lebih mendekati emas murni adalah emas 24 karat. Sehingga emas kadar 24 karat paling mendekati emas murni dan paling sesuai untuk dijadikan standar muktabar secara fikih."
        ]
      },
      {
        "tanya": [
          "Apakah ada ruang fikih untuk memilih standar yang lebih menguntungkan orang fakir dan sesuai dengan maqāṣid az-zakāh?"
        ],
        "jawab": [
          "Tentu ada ruang fikih untuk memilih standar yang lebih menguntungkan orang-orang fakir, karena maqāṣid az-zakāh (maksud peruntukkan zakat) itu sendiri ialah kemaslahatan mustahiq."
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
        ]
      },
      {
        "tanya": [
          "Bagaimana solusi atau bentuk akad yang sesuai dengan prinsip syariah agar praktik tersebut dapat dilakukan tanpa menimbulkan unsur yang dilarang?"
        ],
        "jawab": [
          "Akad yang dapat dijadikan sebagai solusi adalah akad ijarah (sewa), yakni dengan menyewa wahana dan alat yang digunakan menangkap/menjaring. Sedangkan hasil tangkapannya dianggap sebagai hibah (pemberian cuma-cuma)."
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
        ]
      },
      {
        "tanya": [
          "Apabila penggabungan tidak diperbolehkan, apakah penduduk masing-masing wilayah wajib mendatangi tempat lain yang memenuhi syarat pelaksanaan shalat Jumat, ataukah kewajiban Jumat gugur dari mereka sehingga diganti dengan shalat Zuhur?"
        ],
        "jawab": [
          "Tidak wajib, kecuali bila mendengar panggilan azan dari masjid lain, dan sebaiknya memilih masjid yang terbanyak jamaahnya."
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
        ]
      },
      {
        "tanya": [
          "Apakah tujuan amar ma'ruf nahi munkar, edukasi, peringatan kepada masyarakat, atau kemaslahatan umum dapat menjadi alasan yang membenarkan penyebaran konten tersebut?"
        ],
        "jawab": [
          "Ya, bila maslahah yang dihasilkan lebih besar dibanding mafsadah. Namun, jika materi konten dianggap memiliki dampak buruk, maka semua tindakan yang mempengaruhi algoritma penyebaran dihukumi haram, baik kontribusi penyebaran itu signifikan maupun skala kecil."
        ]
      },
      {
        "tanya": [
          "Bagaimana batasan (ḍawābiṭ) syariat dalam membedakan antara penyebaran informasi yang dibenarkan karena mengandung kemaslahatan dengan penyebaran yang termasuk ghibah, tasyhir (mempermalukan), tajassus (mencari-cari kesalahan), atau pelanggaran terhadap hak privasi seseorang?"
        ],
        "jawab": [
          "Penyebaran konten harus mempertimbangkan dengan kemaslahaatan (kebutuhan) dan mafsadah (dampak buruk) dari konten tersebut. Oleh karena itu, pengguna sosial media sangat diimbau untuk lebih bijak dalam memilah konten, baik untuk disimpan secara pribadi, diberi like (suka), di-repost (posting ulang), maupun tindakan lain yang dapat memengaruhi penyebaran konten terkait."
        ]
      },
      {
        "tanya": [
          "Bagaimana pandangan fikih terhadap hak untuk dilupakan (right to be forgotten) di ruang digital bagi seseorang yang rekam jejak aib masa lalunya masih tersebar. Padahal ia telah bertaubat atau telah menjalani hukuman resminya Dan sejauh mana kewajiban pihak lain atau platform untuk menghapus (take down) konten tersebut?"
        ],
        "jawab": [
          "Tindakan take down (penghapusan) wajib dilakukan oleh pihak yang menyebarkan konten tersebut, baik individu yang terekam, perekam, maupun pengelola platform media.",
          "Kewajibannya tersebut dilaksanakan sesuai dengan kapasitas dan kemampuan masing-masing pihak penyebar."
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
