# Install LegionBoard Eye

*This is the English version of the installation guide. Other available
languages are: [Deutsch](german.md)*

This document will guide you through the installation of LegionBoard Eye.
You can find the online version on
[GitLab](https://gitlab.com/legionboard/eye/blob/master/install/english.md) and
[GitHub](https://github.com/legionboard/eye/blob/master/install/english.md). If
you spot an issue or have a question, don't hestiate to open an issue
on [GitLab](https://gitlab.com/legionboard/eye/issues) or send me a
[mail](mailto:nicoalt@posteo.org).

## Download

You can download LegionBoard Eye either from
[GitLab](https://gitlab.com/legionboard/eye/tags) or from
[GitHub](https://github.com/legionboard/eye/releases). Make sure
that you do not accidentially download a beta version. After the download
completed, unzip the archive you just downloaded.

## Configure

Go to "src/config" in the directory of your unzipped LegionBoard
Eye download and rename "configuration-template.js" to "configuration.js".
Then open "configuration.js" with a text editor and edit the following
line:
```
'apiRoot': 'https://example.com/legionboard/heart',
```

After you configured this, your LegionBoard Eye instance is ready to use.
But likely you want to deploy it on your school's server.

## Optional: Deploy on your server

Therefore, open the tool you usually use for uploading files, for example
[FileZilla](https://filezilla-project.org/), and upload the whole "src"
directory. I recommend renaming it to "eye" and push it in a folder
named "legionboard".
