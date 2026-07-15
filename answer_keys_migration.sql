
-- 1. Create the answer_keys table
CREATE TABLE IF NOT EXISTS public.answer_keys (
  question_id text PRIMARY KEY,
  correct_answer text NOT NULL
);

-- Enable RLS
ALTER TABLE public.answer_keys ENABLE ROW LEVEL SECURITY;

-- 2. Create RPC function to get correct answer securely
CREATE OR REPLACE FUNCTION get_correct_answer(q_id text)
RETURNS text AS $$
DECLARE
  real_answer text;
BEGIN
  SELECT correct_answer INTO real_answer FROM public.answer_keys WHERE question_id = q_id;
  RETURN real_answer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Admin RPC to insert custom questions with answer
CREATE OR REPLACE FUNCTION insert_custom_question(p_id text, p_bank text, p_q text, p_opts jsonb, p_a text, p_cat text, p_unit text)
RETURNS void AS $$
BEGIN
  -- Verify admin status
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND isAdmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Insert into public custom_questions (WITHOUT answer)
  INSERT INTO public.custom_questions (id, bank, q, opts, cat, unit)
  VALUES (p_id, p_bank, p_q, p_opts, p_cat, p_unit)
  ON CONFLICT (id) DO UPDATE SET
    bank = EXCLUDED.bank, q = EXCLUDED.q, opts = EXCLUDED.opts, cat = EXCLUDED.cat, unit = EXCLUDED.unit;

  -- Insert answer into secure answer_keys table
  INSERT INTO public.answer_keys (question_id, correct_answer)
  VALUES (p_id, p_a)
  ON CONFLICT (question_id) DO UPDATE SET
    correct_answer = EXCLUDED.correct_answer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Delete the existing answer keys to prevent duplicates, then Insert all pre-defined answer keys
DELETE FROM public.answer_keys WHERE question_id LIKE 'gk_%' OR question_id LIKE 'cuet_%' OR question_id LIKE 'nta_%';

INSERT INTO public.answer_keys (question_id, correct_answer) VALUES
('gk_0', 'चार'),
('gk_1', 'वैखरी वाणी'),
('gk_2', 'देवनागरी लिपि'),
('gk_3', 'संस्कारित या परिमार्जित भाषा'),
('gk_4', 'वृद्धिरादैच्'),
('gk_5', 'विष्णु शर्मा'),
('gk_6', 'नारायण भट्ट'),
('gk_7', 'अमरसिंह'),
('gk_8', 'श्रावणी पूर्णिमा को'),
('gk_9', 'बृहदारण्यकोपनिषद्'),
('gk_10', '१६'),
('gk_11', 'अ'),
('gk_12', 'कालिदास'),
('gk_13', 'तुरंग'),
('gk_14', 'भारवि का'),
('gk_15', 'माघ का'),
('gk_16', 'विराट् कृति छन्द (१०६ अक्षर)'),
('gk_17', 'चार'),
('gk_18', 'ऋक्-यजु:-साम'),
('gk_19', 'होता'),
('gk_20', 'अध्वर्यु'),
('gk_21', 'उद्गाता'),
('gk_22', 'ब्रह्मा'),
('gk_23', 'इन्द्र की'),
('gk_24', 'दस'),
('gk_25', '१०२८ सूक्त'),
('gk_26', 'ऋग्वेद में'),
('gk_27', 'शुक्लयजुर्वेद एवं कृष्णयजुर्वेद'),
('gk_28', '२० काण्ड'),
('gk_29', '७३० सूक्त'),
('gk_30', 'नासदीय सूक्त में'),
('gk_31', '११३१ शाखाएँ'),
('gk_32', 'आचार्य सायण का'),
('gk_33', 'छः'),
('gk_34', 'अष्टाध्यायी'),
('gk_35', 'पतञ्जलि'),
('gk_36', 'लगभग ४००० सूत्र'),
('gk_37', 'यास्क'),
('gk_38', 'आचार्य पिङ्गल'),
('gk_39', 'भट्टोजी दीक्षित'),
('gk_40', 'वरदराज'),
('gk_41', 'वेद के नाक की'),
('gk_42', 'वेद के हाथ की'),
('gk_43', 'वेद के पैर की'),
('gk_44', 'वेद के नेत्र की'),
('gk_45', 'पाणिनि, कात्यायन, पतञ्जलि'),
('gk_46', 'कात्यायन'),
('gk_47', 'चार'),
('gk_48', '१०८'),
('gk_49', 'मुण्डकोपनिषद् में'),
('gk_50', 'बृहदारण्यकोपनिषद् में'),
('gk_51', 'शुक्ल यजुर्वेद से'),
('gk_52', '१३'),
('gk_53', 'याज्ञवल्क्य'),
('gk_54', 'संहिता एवं ब्राह्मण'),
('gk_55', 'आध्यात्मिक चिन्तन'),
('gk_56', 'सांख्य-योग-न्याय-वैशेषिक-मीमांसा-वेदान्त'),
('gk_57', 'महर्षि कपिल'),
('gk_58', 'पतञ्जलि'),
('gk_59', 'चित्तवृत्तिनिरोध'),
('gk_60', 'चार (प्रत्यक्ष, अनुमान, उपमान, शब्द)'),
('gk_61', 'सात'),
('gk_62', 'उपनिषद्, भगवद्गीता तथा ब्रह्मसूत्र'),
('gk_63', 'चार्वाक, जैन, बौद्ध'),
('gk_64', 'यम, नियम, आसन, प्राणायाम, प्रत्याहार, धारणा, ध्यान, समाधि'),
('cuet_0', 'षष्ठी विभक्ति'),
('cuet_1', 'प्रथमा बहुवचन'),
('cuet_2', 'षष्ठी/पञ्चमी एकवचन'),
('cuet_3', 'प्रथमा/द्वितीया बहुवचन (नपुंसकलिङ्ग)'),
('cuet_4', 'सप्तमी एकवचन'),
('cuet_5', 'तृतीया/चतुर्थी/पञ्चमी द्विवचन'),
('cuet_6', 'सप्तमी बहुवचन'),
('cuet_7', 'तृतीया एकवचन'),
('cuet_8', 'लट् लकार'),
('cuet_9', 'लङ् लकार'),
('cuet_10', 'लृट् लकार'),
('cuet_11', 'लोट् लकार'),
('cuet_12', 'विधिलिङ् लकार'),
('cuet_13', 'दस लकार'),
('cuet_14', 'प्रथम पुरुष बहुवचन'),
('cuet_15', 'कृ धातु'),
('cuet_16', 'दीर्घ सन्धि'),
('cuet_17', 'गुण सन्धि'),
('cuet_18', 'वृद्धि सन्धि'),
('cuet_19', 'यण् सन्धि (इत्यादि)'),
('cuet_20', 'व्यंजन सन्धि (सज्जनः)'),
('cuet_21', 'विसर्ग सन्धि (दुस्तरम्)'),
('cuet_22', 'पाँच'),
('cuet_23', 'नयनम् (अयादि सन्धि)'),
('cuet_24', 'तत्पुरुष समास'),
('cuet_25', 'बहुव्रीहि समास'),
('cuet_26', 'द्वन्द्व समास'),
('cuet_27', 'अव्ययीभाव समास'),
('cuet_28', 'द्विगु समास'),
('cuet_29', 'कर्मधारय समास'),
('cuet_30', 'चार (अव्ययीभाव, तत्पुरुष, बहुव्रीहि, द्वन्द्व)'),
('cuet_31', 'बहुव्रीहि समास'),
('cuet_32', 'ल्युट् प्रत्यय'),
('cuet_33', 'क्त्वा प्रत्यय'),
('cuet_34', 'तुमुन् प्रत्यय'),
('cuet_35', 'क्तवतु प्रत्यय'),
('cuet_36', 'शतृ प्रत्यय'),
('cuet_37', 'धातुओं के साथ'),
('cuet_38', 'प्रातिपदिक (संज्ञा) के साथ'),
('cuet_39', 'तल् (तद्धित प्रत्यय)'),
('cuet_40', 'प्रथमा विभक्ति'),
('cuet_41', 'द्वितीया विभक्ति'),
('cuet_42', 'तृतीया विभक्ति'),
('cuet_43', 'चतुर्थी विभक्ति'),
('cuet_44', 'पञ्चमी विभक्ति'),
('cuet_45', 'सप्तमी विभक्ति'),
('cuet_46', 'चतुर्थी एकवचन'),
('cuet_47', 'छह (कर्ता, कर्म, करण, सम्प्रदान, अपादान, अधिकरण)'),
('cuet_48', 'उपमा अलङ्कार'),
('cuet_49', 'रूपक अलङ्कार'),
('cuet_50', 'उत्प्रेक्षा अलङ्कार'),
('cuet_51', 'अनुप्रास अलङ्कार'),
('cuet_52', 'श्लेष अलङ्कार'),
('cuet_53', 'दो (शब्दालङ्कार और अर्थालङ्कार)'),
('cuet_54', 'यमक अलङ्कार'),
('cuet_55', 'चार (उपमेय, उपमान, साधारण धर्म, वाचक शब्द)'),
('cuet_56', '३२ अक्षर (प्रति पाद ८)'),
('cuet_57', 'चार पाद'),
('cuet_58', 'ग्यारह अक्षर'),
('cuet_59', 'चौदह अक्षर'),
('cuet_60', 'पन्द्रह अक्षर'),
('cuet_61', 'उन्नीस अक्षर'),
('cuet_62', 'दो (वैदिक छन्द और लौकिक छन्द)'),
('cuet_63', '२४ अक्षर (प्रति पाद ८, तीन पाद)'),
('cuet_64', 'बाणभट्ट, दण्डी, सुबन्धु'),
('cuet_65', 'बाणभट्ट'),
('cuet_66', 'दण्डी'),
('cuet_67', 'सुबन्धु'),
('cuet_68', 'कालिदास'),
('cuet_69', 'कालिदास'),
('cuet_70', 'भारवि'),
('cuet_71', 'माघ'),
('nta_0', 'मीमांसकों ने'),
('nta_1', 'शुक्ल यजुर्वेद'),
('nta_2', 'परमात्मा (भाववृत्त)'),
('nta_3', 'चार (नाम, आख्यात, उपसर्ग, निपात)'),
('nta_4', '२५'),
('nta_5', 'पाँच'),
('nta_6', 'भावरूप, अनिर्वचनीय'),
('nta_7', 'तीन'),
('nta_8', 'आठ'),
('nta_9', 'ध्वनि-परिवर्तन से'),
('nta_10', 'वृद्धि संज्ञा'),
('nta_11', 'प्रथम अध्याय (चतुर्थ पाद)'),
('nta_12', 'मम्मट'),
('nta_13', 'चार'),
('nta_14', 'विदाई (विदा) अंक'),
('nta_15', 'चारुदत्त'),
('nta_16', 'दस'),
('nta_17', 'तीन (आचार, व्यवहार, प्रायश्चित्त)'),
('nta_18', 'ब्राह्मी'),
('nta_19', 'रुद्रदामन');
