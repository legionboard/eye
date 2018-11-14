# LegionBoard Eye installieren

*Das ist die deutsche Version des Installations-Leitfaden. Übersetzungen
sind für folgende Sprachen verfügbar: [English](english.md)*

Dieses Dokument wird Sie durch die Installation von LegionBoard Eye führen.
Sie können die Online-Version auf
[GitLab](https://gitlab.com/legionboard/eye/blob/master/install/german.md) und
[GitHub](https://github.com/legionboard/eye/blob/master/install/german.md) finden.
Wenn Sie einen Fehler entdecken oder eine Frage haben, zögern Sie nicht,
einen Issue auf [GitLab](https://gitlab.com/legionboard/eye/issues) zu öffnen
oder senden Sie mir eine [E-Mail](mailto:nicoalt@posteo.org).

## Herunterladen

Sie können LegionBoard Eye entweder von
[GitLab](https://gitlab.com/legionboard/eye/tags) oder von
[GitHub](https://github.com/legionboard/eye/releases) herunterladen.
Stellen Sie sicher, dass Sie nicht aus Versehen eine Beta-Version
herunterladen. Entpacken Sie das Archiv, nachdem Sie es heruntergeladen
haben.

## Konfigurieren

Gehen Sie in den Order "src/config" des entpackten Archivs
und benennen die Datei "configuration-template.js" in "configuration.js"
um. Danach müssen Sie "configuration.js" mit einem Text-Editor öffnen und
die folgende Zeile bearbeiten, damit der Link zu Ihrem Ordner von
LegionBoard Heart zeigt:
```
'apiRoot': 'https://example.com/legionboard/heart',
```

## Auf Server hochladen

Öffnen Sie dazu das Programm, das Sie normalerweise benutzen, um Dateien
auf Ihren Server hochzuladen, wie zum Beispiel
[FileZilla](https://filezilla-project.org/), und laden Sie den kompletten
"src" Order hoch. Ich empfehle, ihn in "eye" umzubenennen und in
den Order "legionboard" zu verschieben.
