import { update } from 'lodash';
import 'remixicon/fonts/remixicon.css'
require('./bootstrap');

document.onreadystatechange = () => {
    require('./customjs/menu');
    require('./customjs/search');
    require('./customjs/friends');
    require('./customjs/newpost');
}

$(document).ready(function () {
    setLoadCommentsBtn();
    setTextareaHeightAuto();
    setAddCommentBtn();
    setDeleteCommentBtn();
    setReactionsBtns();
});

var postsPage = 1;
$(window).on('scroll', function () {
    if (Math.ceil($(window).scrollTop()) + Math.ceil($(window).height()) >= $(document).height() && postsPage) {
        if (postsPage) {
            postsPage++
            loadPosts(postsPage);
        }
    }
});

function loadPosts() {
    let url = window.location.pathname + '?page='
    $.ajax({
        url: url + postsPage,
        type: 'GET',
        beforeSend: function () {
            $('#load-message').removeClass('d-none');
        }
    }).done(function (data) {
        if (data.html.length == 0) {
            postsPage = false;
            $('#load-message').text('No more posts to show').removeClass('d-none');
        } else {
            $('#load-message').addClass('d-none');
            $('#container-feed').append(data.html);
            setLoadCommentsBtn();
            setAddCommentBtn();
            setDeleteCommentBtn();
            setReactionsBtns();
        }
    });
}

function setLoadCommentsBtn() {
    $('.comments-btn').each(function () {
        $(this).off()
        $(this).on('click', loadMoreComments);
        $(this).removeClass('comments-btn');
    });
}

function loadMoreComments(event) {
    var button = $(event.target);
    var post = $(event.target).closest('.post')
    var id = $(post).attr('data-post');
    $(event.target).text('Loading comments...');
    $.ajax({
        url: 'comments/post/' + id,
        type: 'GET',
    }).done(function (data) {
        $(`[data-post="${id}"] .comment__content--box`).removeClass('line-clamp')
        updatePost(post,data);
        $(button).text('Close comments...').unbind().on('click',closeComments);
    })
}

function setTextareaHeightAuto() {
    $('.comment-textarea').each(function () {
        this.setAttribute('style', 'overflow-y:auto;');
    }).on('input', function () {
        if (this.scrollHeight <= 200) {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight + 2) + 'px';
        }
    });
}

function closeComments() {
    $(event.target).siblings('.comment').not(':first').remove();
    $(event.target).text('See more comments...').on('click', loadMoreComments);
}

function setAddCommentBtn() {
    $('.addComment-btn').each(function () {
        $(this).on('click', addComment);
        $(this).removeClass('addComment-btn');
    });
}

function addComment(){
    var id = $(event.target).closest('.post').attr('data-post');
    var comment = $(event.target).siblings('textarea').val();
    $(event.target).siblings('textarea').val('')
    var post = $(event.target).closest('.post');
    $.ajax({
        url: 'comments/create/' + id,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: { content: comment },
        type: 'POST',
    }).done(function(data) {
        updatePost(post,data);
    });
}

function updatePost(post, data) {
    $(post).find('.post-description').text(data.post.description);
    if(data.post.image != null) $(post).find('.card-img-bottom').removeClass('d-none');
    $(post).find('.card-img-bottom').attr('src',data.post.image);
    $(post).find('.dislikes-count').text(data.post.dislikes_count);
    $(post).find('.likes-count').text(data.post.likes_count);
    $(post).find('.comments-count').text(data.post.comments_count);

    const like = $(post).find('[class^="ri-thumb-up"]');
    const dislike = $(post).find('[class^="ri-thumb-down"]');
    if(data.post.user_reaction === null) {
        $(like).removeClass().addClass('ri-thumb-up-line');
        $(dislike).removeClass().addClass('ri-thumb-down-line');
    } else if (data.post.user_reaction.type == 'dislike') {
        $(like).removeClass().addClass('ri-thumb-up-line');
        $(dislike).removeClass().addClass('ri-thumb-down-fill');
    } else {
        $(like).removeClass().addClass('ri-thumb-up-fill');
        $(dislike).removeClass().addClass('ri-thumb-down-line');
    }

    if(data.comments !== undefined) {
        var commentBox = $(post).find('.comments-container');
        var commentsBtn = $(post).find('.comments-guide');

        if ($(commentsBtn).text().includes('See more comments...')) {
            $(commentsBtn).trigger('click');
        } else {
            $(commentBox).find('.comment').remove();
            $(commentBox).prepend(data.comments);
        }
    } else {
        if(data.post.comments.length > 1) {
            for (let comment of data.post.comments) {
                $('[data-comment='+comment.id+']').find('.card-text').text(comment.content);
            }
        }
    }
    $(commentBox).on('click','.commentDelete-btn',deleteComment);
}

function setDeleteCommentBtn() {
    $('.commentDelete-btn').each(function () {
        $(this).on('click', deleteComment);
        $(this).removeClass('commentDelete-btn');
    });
}

function deleteComment() {
    var id = $(event.target).closest('.comment').attr('data-comment');
    var post = $(event.target).closest('.post');
    $.ajax({
        url: 'comments/delete/' + id,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: 'DELETE',
    }).done(function(data) {
        updatePost(post,data);
    });
}

function setReactionsBtns() {
    $('.like-btn').each(function () {
        $(this).on('click', likePost);
        $(this).removeClass('like-btn');
    });
    $('.dislike-btn').each(function () {
        $(this).on('click', dislikePost);
        $(this).removeClass('dislike-btn');
    });
}

function likePost(){
    var post = $(event.target).closest('.post');
    var id = $(post).attr('data-post');
    var type = $(event.target).hasClass('ri-thumb-up-fill') ? 'DELETE' : 'POST';
    $.ajax({
        url: 'reactions/like/' + id,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: type,
    }).done(function(data) {
        updatePost(post,data);
    });
}

function dislikePost(){
    var post = $(event.target).closest('.post');
    var id = $(post).attr('data-post');
    var type = $(event.target).hasClass('ri-thumb-down-fill') ? 'DELETE' : 'POST';
    $.ajax({
        url: 'reactions/dislike/' + id,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: type,
    }).done(function(data) {
        updatePost(post,data);
    });
}

