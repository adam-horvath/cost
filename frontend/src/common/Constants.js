import Colors from "../colors/Colors";

class Constants {
  static BASE_URL = "https://horvathadam.info:8080/api/";
  static PLACEHOLDER_EMAIL = "Email";
  static PLACEHOLDER_PASSWORD = "Jelszó";
  static TIME_ZONE = "Europe/Budapest";
  static NO_CONNECTION = "Nincs\xa0kapcsolat!";

  static INCOME_CATEGORIES = [
    "Ajándék",
    "Állam",
    "Befektetés",
    "Fizetés",
    "Kölcsön",
    "Egyéb"
  ];

  static INCOME_CATEGORIES_WITH_EMPTY = [
    "",
    "Ajándék",
    "Állam",
    "Befektetés",
    "Fizetés",
    "Kölcsön",
    "Egyéb"
  ];

  static COST_CATEGORIES = [
    "Ajándék",
    "Autó",
    "Bank",
    "Befektetés",
    "Bevásárlás",
    "Gyógyszertár",
    "Ház",
    "Kaja",
    "Kocsma",
    "Kölcsön",
    "Luxus",
    "Rezsi",
    "Ruha",
    "Telefon",
    "Utazás",
    "Egyéb"
  ];

  static COST_CATEGORIES_WITH_EMPTY = [
    "",
    "Ajándék",
    "Autó",
    "Bank",
    "Befektetés",
    "Bevásárlás",
    "Gyógyszertár",
    "Ház",
    "Kaja",
    "Kocsma",
    "Kölcsön",
    "Luxus",
    "Rezsi",
    "Ruha",
    "Telefon",
    "Utazás",
    "Egyéb"
  ];

  static MONTHS = [
    "január",
    "február",
    "március",
    "április",
    "május",
    "június",
    "július",
    "augusztus",
    "szeptember",
    "október",
    "november",
    "december"
  ];

  static CATEGORY_CHECKBOXES = [
    "Egyenleg",
    "Bevétel",
    "Kiadás",
    "Ajándék",
    "Autó",
    "Bank",
    "Befektetés",
    "Bevásárlás",
    "Gyógyszertár",
    "Ház",
    "Kaja",
    "Kocsma",
    "Kölcsön",
    "Luxus",
    "Rezsi",
    "Ruha",
    "Telefon",
    "Utazás",
    "Egyéb"
  ];

  static LINE_COLORS = [
    Colors.yellow,
    Colors.purple,
    Colors.lightGreen,
    Colors.darkGray,
    Colors.orange,
    Colors.cyan,
    Colors.kheki,
    Colors.pink
  ];

  static LINE_CHART_ANIMATION_LENGTH = 1000;
  static BAR_CHART_ANIMATION_LENGTH = 700;
}

export default Constants;
