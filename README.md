# Walde CLI
The official command-line interface for [Walde](https://walde.ai), a powerful platform to create and
manage beautiful and performant online content.


## Installation
```bash
npm i -g @walde.ai/cli
```

## Quick Start
Initialize a new Walde project in your current directory:
```bash
walde init
```

This creates a `walde.json` configuration file that links your local project to a Walde site.

## Usage

### Site Management
```bash
# Create a new site
walde site create

# List your sites
walde site list

# Delete a site
walde site delete --name my-site
```

### Content Management
```bash
# Push a single content file
walde content push path/to/content.md

# Push all content files
walde content push --all

# List content in a site
walde content list
```

### Frontend Deployment
```bash
# Push frontend files
walde ui push path/to/dist

# Invalidate CDN cache
walde cache invalidate --site-id <id>
```

### Authentication
```bash
# Get temporary AWS credentials for asset uploads
walde credentials get

# Refresh authentication token
walde credentials refresh
```

## Documentation
For full documentation, visit [docs.walde.ai](https://docs.walde.ai).

## License
MIT — see [LICENSE](./LICENSE).
