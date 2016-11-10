# LegionBoard Eye

[![Code Climate](https://codeclimate.com/github/legionboard/eye/badges/gpa.svg)](https://codeclimate.com/github/legionboard/eye)

This is the eye of [LegionBoard](http://legionboard.org):
it is the preferred client of its
[REST API](https://gitlab.com/legionboard/heart)
and based on HTML and JavaScript,
so that it can be run on local machines without any server software.
You can for example upload it to GitLab pages to have your own client,
independent from your institution's main client.
All you need to do is to download the source code,
add your API to the [configuration](src/config/configuration-template.js)
and open the site in a browser.
You can find an installation guide [here](install/english.md).
Have fun and enjoy!

This version of Eye requires version `0.2.0` or newer of
[Heart](https://gitlab.com/legionboard/heart). 


## Dependencies

* [Bootstrap](https://getbootstrap.com/)
* [Bootstrap Datepicker](https://eonasdan.github.io/bootstrap-datetimepicker/)
* [Bootstrap Dropdown Enhancement](https://behigh.github.io/bootstrap_dropdowns_enhancement/)
* [jQuery](https://jquery.com/)
* [jsSHA](https://caligatio.github.io/jsSHA/)
* [SweetAlert](https://t4t5.github.io/sweetalert/)

## License

The idea for a changes management system like LegionBoard was first
implemented by Tom Kurjak in a pioneer project called 'Ausfallplan'.
It was taken up by [Nico Alt](mailto:nicoalt@posteo.org) by developing a
completely new project that's up to the current technical standards.

This project is licensed under the GPLv3 license.
For more information, see [LICENSE](./LICENSE).

## Repositories

Official repository:
[GitLab](https://gitlab.com/legionboard/eye)

Official mirrors (Pull Request are welcome):
* [GitHub](https://github.com/legionboard/eye)
