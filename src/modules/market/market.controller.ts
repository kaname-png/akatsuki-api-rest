import {
  Controller,
  Put,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Post,
} from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketModel } from './models/market.model';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../decorators/user.decorator';
import { CommentMarketDto } from './dto/comment.add.dto';
import { CommentRemoveMarketDto } from './dto/comment.remove.dto';
import { BuyerRemoveMarketDto } from './dto/buyer.remove.dto';
import { Rank } from '../../decorators/rank.decorator';
import { RanksEnum } from '../../keys/ranks.enum';
import { RankGuard } from '../../guards/rank.guard';
import { ReactionAddMarketDto } from './dto/reaction.add.dto';
import { ReactionRemoveMarketDto } from './dto/reaction.remove.dto';
import { I18nService, I18nLang } from 'nestjs-i18n';

@UseGuards(AuthGuard(), RankGuard)
@Controller('market')
export class MarketController {
  constructor(
    private readonly marketService: MarketService,
    private readonly i18nService: I18nService,
  ) { }

  @Rank(RanksEnum.SELLER, RanksEnum.MODERATOR, RanksEnum.ADMINISTRATOR)
  @Put('/add/product')
  public async AddProduct(
    @Body() marketModel: MarketModel,
    @Res() response,
    @GetUser('id') idUserRequest: string,
    @I18nLang() lang: string,
  ) {
    return await this.marketService
      .AddProduct(marketModel, idUserRequest)
      .then(() => {
        response.status(HttpStatus.CREATED).json({
          statusCode: HttpStatus.CREATED,
          message: this.i18nService.translate(
            'translations.market.controller.product_added',
            {
              lang,
            },
          ),
        });
      });
  }

  @Rank(RanksEnum.MODERATOR, RanksEnum.ADMINISTRATOR)
  @Post('/approve/product')
  public async ApproveProduct(
    @Body('product') productId: string,
    @Res() response,
    @I18nLang() lang: string,
  ) {
    return this.marketService.ApproveProduct(productId).then(() => {
      response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: this.i18nService.translate(
          'translations.market.controller.product_added',
          {
            lang,
          },
        ),
      });
    });
  }

  @Rank(RanksEnum.MODERATOR, RanksEnum.ADMINISTRATOR)
  @Get('/approve/pending')
  public async GetNoApprovedProducts() {
    return await this.marketService.GetNoApprovedProducts();
  }

  @Get('/get/product/:id')
  public async GetProduct(
    @Param('id') productId: string,
    @GetUser('rank') rankUserRequest: string[],
    @GetUser('id') idUserRequest: string,
  ) {
    return await this.marketService.GetProduct(
      productId,
      rankUserRequest,
      idUserRequest,
    );
  }

  @Post('/verify/reaction')
  public async VerifyReactionProduct(
    @Body('product') productId: string,
    @Body('user') userId: string,
    @GetUser('id') userRequestId: string,
    @Res() response,
  ) {
    return await this.marketService.VerifyReactionsProduct(productId, userId, userRequestId).then(() => {
      response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'The user has already reacted to this product.',
      });
    });
  }

  @Post('/verify/purchase')
  public async VerifyPurchaseProduct(
    @Body('product') productId: string,
    @Body('user') userId: string,
    @GetUser('id') userRequestId: string,
    @Res() response,
  ) {
    return await this.marketService.VerifyPurchaseProduct(productId, userId, userRequestId).then(() => {
      response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'The user has already bought this product. ',
      });
    });
  }
  
  @Post('/verify/comment')
  public async VerifyCommentProduct(
    @Body('product') productId: string,
    @Body('user') userId: string,
    @GetUser('id') userRequestId: string,
    @Res() response,
  ) {
    return await this.marketService.VerifyCommentProduct(productId, userId, userRequestId).then(() => {
      response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'The user has already commented to this product.',
      });
    });
  }

  @Get('/get/products/:filter/:market')
  public async GetAllProducts(
    @Param('filter', ParseIntPipe) productId: number,
    @Param('market', ParseIntPipe) marketId: number,
    @GetUser('rank') rankUserRequest: string[],
    @GetUser('id') idUserRequest: string,
  ) {
    return await this.marketService.GetAllProducts(
      productId,
      marketId,
      rankUserRequest,
      idUserRequest,
    );
  }

  @Put('/add/comment')
  public async AddComment(
    @Body() commentMarketDto: CommentMarketDto,
    @Res() response,
    @GetUser('id') idUserRequest: string,
    @I18nLang() lang: string,
  ) {
    return await this.marketService
      .AddComment(commentMarketDto, idUserRequest)
      .then(() => {
        response.status(HttpStatus.OK).json({
          statusCode: HttpStatus.OK,
          message: this.i18nService.translate(
            'translations.market.controller.comment_added',
            {
              lang,
            },
          ),
        });
      });
  }

  @Put('/add/reaction')
  public async AddReaction(
    @Body() reactionAddMarketDto: ReactionAddMarketDto,
    @Res() response,
    @GetUser('id') idUserRequest: string,
    @I18nLang() lang: string,
  ) {
    return await this.marketService
      .AddReaction(reactionAddMarketDto, idUserRequest)
      .then(() => {
        response.status(HttpStatus.OK).json({
          statusCode: HttpStatus.OK,
          message: this.i18nService.translate(
            'translations.market.controller.reaction_added',
            {
              lang,
            },
          ),
        });
      });
  }

  @Delete('/delete/comment')
  public async RemoveComment(
    @Body() commentRemoveMarketDto: CommentRemoveMarketDto,
    @Res() response,
    @GetUser('id') idUserRequest: string,
    @I18nLang() lang: string,
  ) {
    return await this.marketService
      .RemoveComment(commentRemoveMarketDto, idUserRequest)
      .then(() => {
        response.status(HttpStatus.OK).json({
          statusCode: HttpStatus.OK,
          message: this.i18nService.translate(
            'translations.market.controller.comment_deleted',
            {
              lang,
            },
          ),
        });
      });
  }

  @Rank(RanksEnum.ADMINISTRATOR, RanksEnum.MODERATOR)
  @Delete('/delete/buyer')
  public async RemoveBuyer(
    @Body() buyerRemoveMarketDto: BuyerRemoveMarketDto,
    @Res() response,
    @I18nLang() lang: string,
  ) {
    return await this.marketService
      .RemoveBuyer(buyerRemoveMarketDto)
      .then(() => {
        response.status(HttpStatus.OK).json({
          statusCode: HttpStatus.OK,
          message: this.i18nService.translate(
            'translations.market.controller.buyer_deleted',
            {
              lang,
            },
          ),
        });
      });
  }

  @Delete('/delete/reaction')
  public async RemoveReaction(
    @Body() reactionRemoveMarketDto: ReactionRemoveMarketDto,
    @Res() response,
    @GetUser('id') idUserRequest: string,
    @I18nLang() lang: string,
  ) {
    return await this.marketService
      .RemoveReaction(reactionRemoveMarketDto, idUserRequest)
      .then(() => {
        response.status(HttpStatus.OK).json({
          statusCode: HttpStatus.OK,
          message: this.i18nService.translate(
            'translations.market.controller.reaction_deleted',
            {
              lang,
            },
          ),
        });
      });
  }

  @Delete('/delete/product')
  public async RemoveProduct(
    @Body('product') produtId: string,
    @Res() response,
  ) {
    return await this.marketService.DeleteProduct(produtId).then(() => {
      response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Ok',
      });
    });
  }
}
