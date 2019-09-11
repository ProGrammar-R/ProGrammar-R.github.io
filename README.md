# AzD De-Randomizer

This is a romhacking tool to de-randomize the floor layouts of `Azure Dreams`. Specifically, they should be
deterministically (pseudo)-random, so the Nth floor of the Xth run up the tower will always be the same.

## Browser

https://adrando.com

You can also reach it from https://ProGrammar-R.github.io

## CLI

```shell
$ git clone https://github.com/ProGrammar-R/AD-DeRandomizer
$ cd AD-DeRandomizer
$ git submodule update --init
$ npm install
```

### Usage

To randomize your disc image, just pass in the path to your .bin file using the
`--bin` option. This will use the current time as the seed:

```shell
$ ./randomize -b Azure\ Dreams\ \(USA\).bin
```

You can print the seed used with the `--verbose` flag:

```shell
$ ./randomize -vb Azure\ Dreams\ \(USA\).bin
```

The more `--verbose` flags you include, the more information about the
randomization gets printed:

```shell
$ ./randomize -vvvb Azure\ Dreams\ \(USA\).bin
```

### Seed URLs

If you plan on sharing a seed with others, the easiest way to use CLI is with
the `--race` option and seed URLs. To use the current time as a seed:

```shell
$ ./randomize -rb Azure\ Dreams\ \(USA\).bin
```

To use a custom seed:

```shell
$ ./randomize -rb Azure\ Dreams\ \(USA\).bin -s myseed
```

