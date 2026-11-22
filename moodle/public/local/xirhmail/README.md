# Suivi des invitations XIRH

Plugin local Moodle 5.2. Accessible dans **Administration du site → Utilisateurs → Comptes → Suivi des invitations**, pour les administrateurs et gestionnaires ayant `local/xirhmail:manage`.

## Utilisation

1. Choisir la cohorte et l’affichage **À vérifier ou à relancer**.
2. Vérifier l’adresse auprès de l’étudiant. **Modifier l’adresse** ouvre son profil Moodle natif. Enregistrer la correction puis revenir au suivi.
3. **Renvoyer l’invitation** ouvre un aperçu nominatif. Vérifier le destinataire puis **Envoyer cette invitation**.
4. Le message reprend la charte XIRH, l’identifiant réel du compte, le lien de connexion et « Mot de passe oublié ». Aucun mot de passe n’est lu, généré ou réinitialisé. Le changement de courriel ne renomme pas l’identifiant Moodle.
5. **Vérifier les retours** lance une relève manuelle. La tâche Moodle effectue aussi une relève toutes les cinq minutes, avec au plus 50 nouveaux messages par passage.

Un retour `5.x.x` signale un échec définitif pour ce message. Un retour `4.x.x` indique un retard, dont la livraison peut encore être retentée par les serveurs. Une nouvelle invitation est affichée « envoyée · à surveiller » après acceptation SMTP : ce n’est pas une preuve de livraison ou de lecture. L’absence de retour ne garantit jamais la livraison.

## Configuration OVH

Dans **Plugins → Plugins locaux → Réglages du suivi des invitations**, activer la récupération et définir la boîte dédiée. Son adresse doit être identique à `smtpuser` et `noreplyaddress`. La connexion TLS vérifie le certificat de `ssl0.ovh.net:993` et réutilise les identifiants SMTP dans le processus PHP ; aucune copie de mot de passe n’est stockée par le plugin. Il ne faut pas renseigner une boîte personnelle. L’ancien mécanisme Moodle `handlebounces` doit rester désactivé : il utilise un autre circuit de retour.

Le client IMAP emploie `EXAMINE INBOX` et `BODY.PEEK`, ne supprime ni déplace les messages et ne change pas leur état de lecture. Le curseur UID/UIDVALIDITY est conservé après chaque message traité ; les notifications sont dédupliquées par leur Message-ID et leur destinataire. Les erreurs affichées ou journalisées ne contiennent pas les réponses d’authentification.

Le parseur accepte les rapports MIME `multipart/report; report-type=delivery-status` contenant `message/delivery-status` (RFC 3464), y compris plusieurs destinataires et les encodages base64/quoted-printable. Il ne parcourt pas le corps du message original joint. Taille maximale : 1 Mio ; un avertissement invite à consulter OVH si une pièce trop volumineuse a été ignorée. Les messages ordinaires et les accusés de succès ne deviennent pas des échecs. Les formats propriétaires non conformes restent à examiner dans la boîte OVH.

## Données et envois

Deux tables indépendantes des comptes/cours : diagnostics minimaux de retour et historique des invitations explicites. Aucun corps de courriel ou mot de passe n’y figure. Un rapport sans correspondance unique est conservé sans attribution automatique à un étudiant. Durée configurable de 30 à 730 jours (180 par défaut), avec API Moodle d’export et d’effacement des données personnelles.

Le renvoi nécessite une session autorisée, un jeton CSRF et une demande temporaire liée au destinataire prévisualisé. Un verrou par étudiant, une clé unique de demande et un délai de cinq minutes par adresse empêchent les doubles soumissions. La tentative est enregistrée avant SMTP ; un envoi interrompu reste signalé et n’est pas réessayé automatiquement. Une adresse modifiée après l’aperçu invalide la demande. Les comptes suspendus, supprimés, sans connexion ou ayant bloqué les courriels ne sont pas destinataires.

Les retours ne changent pas automatiquement les comptes ni les préférences d’envoi Moodle : une notification reste un élément à vérifier par l’équipe.

## Validation

La suite `tests/tracker_test.php` couvre le décodage des rapports, les corps joints contenant des faux diagnostics, le cadrage IMAP par longueur, les erreurs tronquées, la synchronisation incrémentale, la déduplication, la séparation des cohortes, les permissions, les changements d’adresse et la double soumission sans réinitialisation de mot de passe. Les envois des tests sont interceptés par Moodle ; aucun courriel étudiant n’est envoyé pendant les tests.

Installation : déployer `local/xirhmail`, exécuter la mise à niveau Moodle et activer la relève dans les réglages. Vérifier le rapport et le journal de la tâche après sa première exécution. Le plugin n’envoie aucune invitation à son installation.
