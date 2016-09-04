# LegionBoard Eye installieren

*Das ist die deutsche Version des Installations-Leitfaden. Eine
[englische Version](english.md) ist ebenfalls verfügbar.*

Dieses Dokument wird Sie durch die Installation on LegionBoard Eye führen.
Sie können die Online-Version auf
[GitLab](https://gitlab.com/legionboard/eye/blob/master/install/german.md) und
[GitHub](https://github.com/legionboard/eye/blob/master/install/german.md) finden.
Wenn Sie einen Fehler finden oder eine Frage haben, öffnen Sie bitte
einen Issue auf [GitLab](https://gitlab.com/legionboard/eye/issues).

## Herunterladen

Sie können LegionBoard Eye entweder von
[GitLab](https://gitlab.com/legionboard/eye/tags) oder von
[GitHub](https://github.com/legionboard/eye/releases) herunterladen.
Stellen Sie sicher, dass Sie nicht aus Versehen eine Beta-Version
herunterladen.

Entpacken Sie das Archiv, nachdem Sie es heruntergeladen haben. Gehen Sie
anschließend in den Order "src/config" des entpackten Archivs und benennen
die Datei "configuration-template.js" in "configuration.js" um. Danach
müssen Sie "configuration.js" mit einem Text-Editor öffnen und
die folgende Zeile bearbeiten:
```
'apiRoot': 'https://api.legionboard.example.com',
```

Nachdem Sie dies konfiguriert haben, ist Ihre LegionBoard Eye Instanz
einsatzbereit. Wahrscheinlich wollen Sie sie aber noch auf Ihrem
Schul-Server installieren.

## Optional: Auf Server hochladen

Öffnen Sie dazu das Programm, das Sie normalerweise benutzen um Dateien
auf Ihren Server hochzuladen, wie zum Beispiel
[FileZilla](https://filezilla-project.org/), und laden Sie den kompletten
"src" Order hoch. Ich empfehle, ihn in "eye" umzubenennen und in
den Order "legionboard" zu verschieben.
