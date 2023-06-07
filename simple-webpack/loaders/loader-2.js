function loader2(sourceCode) {
    console.log('join loader2')
    return sourceCode + `\n const loader2 = 'hello loader2'`
}

module.exports = loader2
