const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    const blogsLikes = blogs.map(blogs => blogs.likes)

    const initialValue = 0
    const likes = blogsLikes.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        initialValue
    )
    return likes
}

const favoriteBlog = (blogs) => {
    const blogsLikes = blogs.map(blogs => blogs.likes)

    const indexOfFavorite = blogsLikes.reduce(
        (indexMax, x, i, blogs) => x > blogs[indexMax] ? i : indexMax, 0
        )
    
    return blogs[indexOfFavorite]
}

const mostBlogs = (blogs) => {
    const authors = blogs.map(blogs => blogs.author)

    let count = 1
    let countMost = 0
    let authorWithMost

    for (i = 0; i < authors.length; i++) {
        for (j = i+1; j < authors.length; j++) {
            if (authors[i] === authors[j]) count++
        }

        if (count > countMost) {
            countMost = count
            authorWithMost = authors[i]
        }
        count = 1
    }

    return {"author": authorWithMost, "blogs": countMost}
}

const mostLikes = (blogs) => {
    const authors = blogs.map(blogs => blogs.author)
    const likes = blogs.map(blogs => blogs.likes)
    let countLikes = 0
    let countMostLikes = 0
    let authorMost

    for (i = 0; i < authors.length; i++) {
        for (j = i; j < authors.length; j++) {
            if (authors[i] === authors[j]) countLikes += likes[j]
        }

        if (countLikes > countMostLikes) {
            countMostLikes = countLikes
            authorMost = authors[i]
        }
        countLikes = 0
    }

    return {"author": authorMost, "likes": countMostLikes}
}
  
  module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
  }